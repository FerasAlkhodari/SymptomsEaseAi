import os
import sys
import threading
import tkinter as tk
import json
from tkinter import ttk, messagebox
from tkinter.scrolledtext import ScrolledText
from PIL import Image, ImageTk, ImageDraw
from datetime import datetime
from ui.styles.colors import COLORS

try:                                  # Pillow >= 9.1
    _LANCZOS = Image.Resampling.LANCZOS
except AttributeError:                # older Pillow
    _LANCZOS = Image.LANCZOS

SESSIONS_DIR = "./data/sessions/"
SESSIONS_FILE = "./sessions.json"

DISCLAIMER_TEXT = (
    "SymptomsEase AI provides preliminary screening only and is not a medical "
    "diagnosis. Always consult a licensed clinician."
)


# --------------------------------------------------------------------------- #
#  Small drawing helpers (pure Tkinter / Pillow — no external theme libs)      #
# --------------------------------------------------------------------------- #
def _hex_to_rgb(value):
    value = value.lstrip('#')
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def _lighten(hex_color, amount=0.14):
    r, g, b = _hex_to_rgb(hex_color)
    r = int(r + (255 - r) * amount)
    g = int(g + (255 - g) * amount)
    b = int(b + (255 - b) * amount)
    return '#%02x%02x%02x' % (r, g, b)


def round_rect_points(x1, y1, x2, y2, r):
    """Point list for a rounded rectangle drawn with a smooth polygon."""
    return [
        x1 + r, y1, x2 - r, y1, x2, y1, x2, y1 + r,
        x2, y2 - r, x2, y2, x2 - r, y2, x1 + r, y2,
        x1, y2, x1, y2 - r, x1, y1 + r, x1, y1,
    ]


def draw_round_rect(canvas, x1, y1, x2, y2, r, **kwargs):
    r = max(0, min(r, (x2 - x1) // 2, (y2 - y1) // 2))
    return canvas.create_polygon(
        round_rect_points(x1, y1, x2, y2, r),
        smooth=True, splinesteps=16, **kwargs,
    )


def make_gradient_image(width, height, color1, color2, radius=0, shape='rect'):
    """A horizontal violet->blue gradient masked to a rounded rect or ellipse.

    Returns an ImageTk.PhotoImage (RGBA) whose corners are transparent so the
    canvas background shows through — that is how we fake rounded/soft edges
    without real alpha compositing in Tk.
    """
    width = max(int(width), 1)
    height = max(int(height), 1)
    r1, g1, b1 = _hex_to_rgb(color1)
    r2, g2, b2 = _hex_to_rgb(color2)
    row = Image.new('RGB', (width, 1))
    for x in range(width):
        t = x / max(width - 1, 1)
        row.putpixel((x, 0), (
            int(r1 + (r2 - r1) * t),
            int(g1 + (g2 - g1) * t),
            int(b1 + (b2 - b1) * t),
        ))
    grad = row.resize((width, height))
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    if shape == 'ellipse':
        draw.ellipse([0, 0, width - 1, height - 1], fill=255)
    else:
        rad = max(0, min(radius, width // 2, height // 2))
        draw.rounded_rectangle([0, 0, width - 1, height - 1], radius=rad, fill=255)
    out = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return ImageTk.PhotoImage(out)


# --------------------------------------------------------------------------- #
#  Reusable widgets                                                            #
# --------------------------------------------------------------------------- #
class PillButton(tk.Canvas):
    """A flat, rounded 'pill' button drawn on a Canvas (no nested tk.Button).

    kind:
      'primary'       -> violet->blue gradient fill, white label
      'record_active' -> danger-tinted fill (used while recording)
      'ghost'         -> subtle surface fill + border, violet label
      'danger'        -> surface fill + border, red label (destructive actions)
    """

    def __init__(self, parent, text, command=None, kind='primary',
                 height=44, width=0, parent_bg=None, font_size=12):
        bg = parent_bg or parent.cget('bg')
        super().__init__(parent, height=height, width=width, bg=bg,
                         highlightthickness=0, bd=0)
        self.text = text
        self.command = command
        self.kind = kind
        self._enabled = True
        self._hover = False
        self._font_size = font_size
        self._grad_cache = {}          # (w, h, state) -> PhotoImage (keep refs)
        self.configure(cursor='hand2')
        self.bind('<Configure>', lambda _e: self._redraw())
        self.bind('<Enter>', self._on_enter)
        self.bind('<Leave>', self._on_leave)
        self.bind('<ButtonRelease-1>', self._on_click)

    # -- public api ----------------------------------------------------------
    def set_text(self, text):
        self.text = text
        self._redraw()

    def set_kind(self, kind):
        self.kind = kind
        self._redraw()

    def set_enabled(self, on):
        self._enabled = bool(on)
        self.configure(cursor='hand2' if on else 'arrow')
        self._redraw()

    def is_enabled(self):
        return self._enabled

    # -- events --------------------------------------------------------------
    def _on_enter(self, _e):
        if self._enabled:
            self._hover = True
            self._redraw()

    def _on_leave(self, _e):
        self._hover = False
        self._redraw()

    def _on_click(self, _e):
        if self._enabled and self.command:
            self.command()

    # -- drawing -------------------------------------------------------------
    def _redraw(self):
        self.delete('all')
        w = self.winfo_width()
        h = self.winfo_height()
        if w <= 1:
            w = int(self['width']) or 1
        if h <= 1:
            h = int(self['height']) or 1
        if w <= 1 or h <= 1:
            return
        r = h // 2
        font = ('Segoe UI', self._font_size, 'bold')

        if not self._enabled:
            draw_round_rect(self, 1, 1, w - 1, h - 1, r,
                            fill=COLORS['surface_alt'], outline=COLORS['border'])
            self.create_text(w // 2, h // 2, text=self.text,
                             fill=COLORS['text_muted'], font=font)
            return

        if self.kind == 'record_active':
            draw_round_rect(self, 1, 1, w - 1, h - 1, r,
                            fill=COLORS['danger_bg'], outline=COLORS['recording_pulse'])
            self.create_oval(16, h // 2 - 4, 24, h // 2 + 4,
                             fill=COLORS['recording_pulse'], outline='')
            self.create_text(w // 2 + 6, h // 2, text=self.text,
                             fill=COLORS['recording_pulse'], font=font)
            return

        if self.kind == 'primary':
            state = 'hover' if self._hover else 'idle'
            key = (w, h, state)
            img = self._grad_cache.get(key)
            if img is None:
                c1, c2 = COLORS['gradient_start'], COLORS['gradient_end']
                if state == 'hover':
                    c1, c2 = _lighten(c1), _lighten(c2)
                img = make_gradient_image(w, h, c1, c2, radius=r)
                self._grad_cache[key] = img
            self.create_image(0, 0, anchor='nw', image=img)
            self.create_text(w // 2, h // 2, text=self.text,
                             fill=COLORS['on_primary'], font=font)
            return

        if self.kind == 'ghost':
            fill = COLORS['surface_alt'] if self._hover else COLORS['surface']
            draw_round_rect(self, 1, 1, w - 1, h - 1, r,
                            fill=fill, outline=COLORS['border'])
            self.create_text(w // 2, h // 2, text=self.text,
                             fill=COLORS['accent_violet'], font=font)
            return

        # 'danger' (destructive: Delete / Clear All)
        fill = COLORS['danger_bg'] if self._hover else COLORS['surface']
        draw_round_rect(self, 1, 1, w - 1, h - 1, r,
                        fill=fill, outline=COLORS['border'])
        self.create_text(w // 2, h // 2, text=self.text,
                         fill=COLORS['danger'], font=font)


class ConfidenceCard(tk.Canvas):
    """A result card showing a disease name, a large % and a confidence bar.

    Purely a *display* layer: the (disease, probability) values come straight
    from predict_disease() and are never modified here.
    """

    def __init__(self, parent, disease, prob, rank, width, parent_bg):
        super().__init__(parent, height=84, width=max(int(width), 1),
                         bg=parent_bg, highlightthickness=0, bd=0)
        self.disease = disease
        self.prob = float(prob)
        self.rank = rank
        self._img = None               # keep a ref to the gradient fill image
        self.bind('<Configure>', lambda _e: self.redraw())

    def redraw(self):
        self.delete('all')
        w = int(self['width'])            # use the requested width so a resize
        if w <= 1:                        # redraw is correct immediately
            w = self.winfo_width()
        if w <= 1:
            w = 1
        h = int(self['height'])
        pad = 18

        # card background
        draw_round_rect(self, 2, 2, w - 2, h - 2, 14,
                        fill=COLORS['surface_alt'], outline=COLORS['border'])

        # disease name + rank caption
        self.create_text(pad, 22, anchor='w', text=self.disease,
                         fill=COLORS['text'], font=('Segoe UI', 14, 'bold'))
        caption = 'Most likely' if self.rank == 1 else 'Secondary'
        self.create_text(pad, 46, anchor='w', text=caption,
                         fill=COLORS['text_secondary'], font=('Segoe UI', 10))

        # large percentage readout (the focal number)
        self.create_text(w - pad, 28, anchor='e', text=f'{self.prob:.0%}',
                         fill=COLORS['accent_blue'], font=('Segoe UI', 18, 'bold'))

        # confidence bar
        tx1, ty1, tx2, ty2 = pad, h - 24, w - pad, h - 14
        track_w = max(tx2 - tx1, 1)
        draw_round_rect(self, tx1, ty1, tx2, ty2, 5, fill=COLORS['bar_track'])
        fill_w = max(10, int(track_w * max(0.0, min(self.prob, 1.0))))
        if self.rank == 1:
            self._img = make_gradient_image(
                fill_w, ty2 - ty1, COLORS['gradient_start'], COLORS['gradient_end'], radius=5)
            self.create_image(tx1, ty1, anchor='nw', image=self._img)
        else:
            draw_round_rect(self, tx1, ty1, tx1 + fill_w, ty2, 5,
                            fill=COLORS['confidence_second'])


class ChatSession:
    """Class to manage individual chat sessions"""

    def __init__(self, name):
        self.name = name
        self.messages = []


class DiseasesEaseApp:
    # severity -> (text color key, tint background key)
    SEVERITY = {
        'info':      ('info', 'info_bg'),
        'success':   ('success', 'success_bg'),
        'warning':   ('warning', 'warning_bg'),
        'error':     ('danger', 'danger_bg'),
        'recording': ('recording_pulse', 'danger_bg'),
    }
    # a redundant, non-color cue per severity (helps color-vision-deficient users)
    GLYPHS = {
        'info': 'ℹ', 'success': '✓', 'warning': '⚠', 'error': '✕', 'recording': '●',
    }

    def __init__(self, root):
        # Initialize main window
        self.root = root
        self.root.title("SymptomsEase AI")
        self.root.geometry("1240x820")
        self.root.minsize(1000, 660)
        self.root.configure(bg=COLORS['background'])

        # Add the icon to the window (guarded — file/platform may not support it)
        try:
            self.root.iconbitmap("./ui/assets/app-icon.ico")
        except Exception:
            pass
        if sys.platform == 'win32':
            try:
                import ctypes
                ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("SymptomsEaseAI")
            except Exception:
                pass

        # Initialize sessions and recorder.  The audio recorder is created
        # lazily on first use so the window can open without the audio stack.
        self.sessions = {}
        self.current_session = None
        self.recorder = None
        self.is_recording = False

        # Recording-indicator state
        self._elapsed = 0
        self._dot_on = True
        self._blink_job = None
        self._tick_job = None
        self._result_cards = []

        # True while viewing an already-analyzed (view-only) session. Both the
        # Record button and the Ctrl+R shortcut consult this so they agree.
        self._read_only = False

        # Load microphone icon (guarded)
        self.microphone_icon = self.load_icon("./ui/assets/mic-icon.png", (30, 30))

        # Setup UI
        self.setup_styles()
        self.create_layout()

        # Restore sessions from metadata, but do not create any default session
        self.restore_sessions()
        self._update_empty_state()

    # ------------------------------------------------------------------ #
    #  Session restore / icon loading                                    #
    # ------------------------------------------------------------------ #
    def restore_sessions(self):
        """Restore sessions from sessions.json on startup."""
        sessions = self.load_sessions()
        if not sessions:
            return  # Do not create any session automatically

        for session in sessions:
            session_name = session["name"]
            session_path = session["path"]

            # Restore session metadata and messages
            if not os.path.exists(session_path):
                continue  # Skip sessions with missing folders

            self.sessions[session_name] = ChatSession(session_name)
            transcription_path = os.path.join(session_path, "transcription1.txt")
            if os.path.exists(transcription_path):
                with open(transcription_path, "r", encoding="utf-8", errors="replace") as f:
                    transcription = f.read()
                self.sessions[session_name].messages.append(f"{transcription}\n")
            self.sessions_list.insert(tk.END, f"  {session_name}")

        # Select the first session with data, if it exists
        if self.sessions_list.size() > 0:
            self.sessions_list.selection_set(0)
            self.on_session_select(None)

    def load_icon(self, path, size):
        """Load and resize an icon (returns None if unavailable)."""
        try:
            image = Image.open(path)
            image = image.resize(size, _LANCZOS)
            return ImageTk.PhotoImage(image)
        except Exception:
            return None

    # ------------------------------------------------------------------ #
    #  Styles                                                            #
    # ------------------------------------------------------------------ #
    def setup_styles(self):
        """Configure custom styles for ttk widgets."""
        style = ttk.Style()
        style.theme_use('clam')   # only 'clam' fully honors custom colors

        style.configure('App.TFrame', background=COLORS['background'])
        style.configure('Card.TFrame', background=COLORS['surface'])

        # Scrollbars (sidebar list + chat document)
        style.configure(
            'Vertical.TScrollbar',
            troughcolor=COLORS['surface'],
            background=COLORS['scrollbar'],
            arrowcolor=COLORS['text_muted'],
            bordercolor=COLORS['surface'],
            relief='flat', borderwidth=0,
        )
        style.map('Vertical.TScrollbar',
                  background=[('active', COLORS['scrollbar_active'])])

        # The sidebar list sits on the lighter 'sidebar' card, so its scrollbar
        # trough must match that — not the chat document's 'surface'.
        style.configure(
            'Sidebar.Vertical.TScrollbar',
            troughcolor=COLORS['sidebar'],
            background=COLORS['scrollbar'],
            arrowcolor=COLORS['text_muted'],
            bordercolor=COLORS['sidebar'],
            relief='flat', borderwidth=0,
        )
        style.map('Sidebar.Vertical.TScrollbar',
                  background=[('active', COLORS['scrollbar_active'])])

    # ------------------------------------------------------------------ #
    #  Layout                                                            #
    # ------------------------------------------------------------------ #
    def create_layout(self):
        """Create main application layout."""
        self.main_frame = tk.Frame(self.root, bg=COLORS['background'])
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=16, pady=16)

        self.create_sidebar()
        self.create_chat_area()

    def _section_label(self, parent, text):
        return tk.Label(
            parent, text=text, font=('Segoe UI', 10, 'bold'),
            fg=COLORS['text_muted'], bg=COLORS['sidebar'], anchor='w',
        )

    def create_sidebar(self):
        """Create sidebar with session management (single canonical version)."""
        # Fixed-width wrapper so the sidebar never collapses on resize.
        wrapper = tk.Frame(self.main_frame, width=300, bg=COLORS['background'])
        wrapper.pack(side=tk.LEFT, fill=tk.Y)
        wrapper.pack_propagate(False)

        sidebar = tk.Frame(wrapper, bg=COLORS['sidebar'],
                           highlightthickness=1, highlightbackground=COLORS['border'])
        sidebar.pack(fill=tk.BOTH, expand=True)

        inner = tk.Frame(sidebar, bg=COLORS['sidebar'])
        inner.pack(fill=tk.BOTH, expand=True, padx=18, pady=18)

        # --- brand row ---
        brand = tk.Frame(inner, bg=COLORS['sidebar'])
        brand.pack(fill=tk.X, pady=(0, 18))
        self.brand_logo = self.load_icon("./ui/assets/logo.png", (34, 34))
        if self.brand_logo is not None:
            tk.Label(brand, image=self.brand_logo, bg=COLORS['sidebar']).pack(side=tk.LEFT)
        else:
            # fallback: a drawn gradient mark if the logo asset is missing
            logo = tk.Canvas(brand, width=34, height=34, bg=COLORS['sidebar'],
                             highlightthickness=0)
            logo.pack(side=tk.LEFT)
            self._logo_img = make_gradient_image(
                34, 34, COLORS['gradient_start'], COLORS['gradient_end'], radius=10)
            logo.create_image(0, 0, anchor='nw', image=self._logo_img)
            logo.create_text(17, 17, text='+', fill=COLORS['on_primary'],
                             font=('Segoe UI', 16, 'bold'))
        tk.Label(brand, text='  SymptomsEase AI', font=('Segoe UI', 14, 'bold'),
                 fg=COLORS['text'], bg=COLORS['sidebar']).pack(side=tk.LEFT)

        # --- section header ---
        self._section_label(inner, 'CHAT SESSIONS').pack(fill=tk.X, pady=(0, 8))

        # --- New Session (primary pill) ---
        PillButton(inner, text='+  New Session', command=self.create_new_session,
                   kind='primary', parent_bg=COLORS['sidebar']).pack(fill=tk.X, pady=(0, 12))

        # --- sessions list ---
        self.sessions_list_frame = tk.Frame(inner, bg=COLORS['sidebar'])
        self.sessions_list_frame.pack(fill=tk.BOTH, expand=True)

        self.sessions_list = tk.Listbox(
            self.sessions_list_frame, bg=COLORS['sidebar'], fg=COLORS['text_secondary'],
            selectmode=tk.SINGLE, font=('Segoe UI', 13), relief=tk.FLAT, borderwidth=0,
            highlightthickness=0, activestyle='none', width=25,
            selectbackground=COLORS['surface_alt'], selectforeground=COLORS['accent_violet'],
            selectborderwidth=0,
        )
        self.sessions_list.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.sessions_list.bind('<<ListboxSelect>>', self.on_session_select)

        self.sidebar_scrollbar = ttk.Scrollbar(
            self.sessions_list_frame, orient=tk.VERTICAL, command=self.sessions_list.yview,
            style='Sidebar.Vertical.TScrollbar',
        )
        self.sidebar_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.sessions_list.config(yscrollcommand=self.sidebar_scrollbar.set)

        # --- divider ---
        tk.Frame(inner, height=1, bg=COLORS['border']).pack(fill=tk.X, pady=12)

        # --- management buttons ---
        self.open_folder_button = PillButton(
            inner, text='Open Session Folder', command=self.open_selected_session_folder,
            kind='ghost', height=40, parent_bg=COLORS['sidebar'])
        self.open_folder_button.pack(fill=tk.X, pady=(0, 8))

        self.delete_button = PillButton(
            inner, text='Delete Session', command=self.delete_selected_session,
            kind='danger', height=40, parent_bg=COLORS['sidebar'])
        self.delete_button.pack(fill=tk.X, pady=(0, 8))

        self.clear_all_button = PillButton(
            inner, text='Clear All Sessions', command=self.clear_all_sessions,
            kind='danger', height=40, parent_bg=COLORS['sidebar'])
        self.clear_all_button.pack(fill=tk.X)

        # --- disclaimer pinned at the bottom ---
        tk.Label(
            inner, text=DISCLAIMER_TEXT, font=('Segoe UI', 9), fg=COLORS['text_muted'],
            bg=COLORS['sidebar'], anchor='w', justify='left', wraplength=246,
        ).pack(fill=tk.X, pady=(14, 0), side=tk.BOTTOM)

    def create_chat_area(self):
        """Create main chat display and input area."""
        chat_outer = tk.Frame(self.main_frame, bg=COLORS['background'])
        chat_outer.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(16, 0))

        # --- header row: current session title + read-only badge ---
        header_row = tk.Frame(chat_outer, bg=COLORS['background'])
        header_row.pack(fill=tk.X)
        self.session_title = tk.Label(
            header_row, text='Welcome', font=('Segoe UI', 18, 'bold'),
            fg=COLORS['text'], bg=COLORS['background'], anchor='w')
        self.session_title.pack(side=tk.LEFT)
        self.readonly_badge = tk.Label(
            header_row, text='', font=('Segoe UI', 10, 'bold'),
            fg=COLORS['warning'], bg=COLORS['warning_bg'], padx=8, pady=2)
        # packed/forgotten dynamically

        # --- status line (dot + message) ---
        status_row = tk.Frame(chat_outer, bg=COLORS['background'])
        status_row.pack(fill=tk.X, pady=(8, 10))
        self.status_dot = tk.Canvas(status_row, width=14, height=14,
                                    bg=COLORS['background'], highlightthickness=0)
        self.status_dot.pack(side=tk.LEFT, padx=(0, 8))
        self.notification_label = tk.Label(
            status_row, text="Ready — create a New Session to begin.",
            font=('Segoe UI', 11), bg=COLORS['info_bg'], fg=COLORS['info'],
            anchor='w', padx=10, pady=4)
        self.notification_label.pack(side=tk.LEFT, fill=tk.X, expand=True)

        # --- transcript card ---
        card = tk.Frame(chat_outer, bg=COLORS['surface'],
                        highlightthickness=1, highlightbackground=COLORS['border'])
        card.pack(fill=tk.BOTH, expand=True)

        self.chat_display = ScrolledText(
            card, wrap=tk.WORD, font=('Segoe UI', 13),
            bg=COLORS['surface'], fg=COLORS['text'], relief=tk.FLAT, bd=0,
            highlightthickness=0, insertbackground=COLORS['primary'],
            padx=18, pady=14, spacing1=3, spacing3=6,
        )
        self.chat_display.pack(fill=tk.BOTH, expand=True)
        self.chat_display.bind('<Configure>', self._on_chat_resize)

        # Text tags for nicer transcript formatting
        self.chat_display.tag_configure(
            'label', foreground=COLORS['accent_violet'],
            font=('Segoe UI', 13, 'bold'), spacing1=8)
        self.chat_display.tag_configure(
            'divider', foreground=COLORS['text_muted'])
        self.chat_display.tag_configure(
            'muted', foreground=COLORS['text_muted'])

        # Restyle the ScrolledText's internal scrollbar (classic tk.Scrollbar)
        try:
            self.chat_display.vbar.configure(
                troughcolor=COLORS['surface'], bg=COLORS['scrollbar'],
                activebackground=COLORS['scrollbar_active'],
                relief='flat', bd=0, highlightthickness=0, width=12)
        except Exception:
            pass

        # --- empty-state overlay (placed over the transcript when idle) ---
        self._build_empty_state(card)

        # --- bottom action bar ---
        btnbar = tk.Frame(chat_outer, bg=COLORS['background'])
        btnbar.pack(fill=tk.X, pady=(12, 0))

        # REC chip (hidden until recording)
        self.rec_chip = tk.Canvas(btnbar, width=124, height=34,
                                  bg=COLORS['background'], highlightthickness=0)

        self.record_button = PillButton(
            btnbar, text='Record', command=self.toggle_recording,
            kind='primary', width=140, parent_bg=COLORS['background'])
        self.record_button.pack(side=tk.RIGHT)

        # Analyze starts de-emphasized ('ghost'); it is promoted to a 'primary'
        # pill once a transcript exists — a cue that Record is step 1.
        self.analyze_button = PillButton(
            btnbar, text='Analyze', command=self.analyze,
            kind='ghost', width=140, parent_bg=COLORS['background'])
        self.analyze_button.pack(side=tk.RIGHT, padx=(0, 10))

        # --- disclaimer under the action bar ---
        tk.Label(
            chat_outer, text=DISCLAIMER_TEXT, font=('Segoe UI', 9),
            fg=COLORS['text_muted'], bg=COLORS['background'], anchor='w',
        ).pack(fill=tk.X, pady=(10, 0))

        # Keyboard shortcuts (safe accelerators only)
        self.root.bind('<Control-n>', lambda _e: self.create_new_session())
        self.root.bind('<Control-r>', lambda _e: self.toggle_recording())

        # initial status dot
        self.set_status("Ready — create a New Session to begin.", 'info')

    def _build_empty_state(self, parent):
        """A friendly empty state shown over the transcript when no session."""
        self.empty_state = tk.Frame(parent, bg=COLORS['surface'])

        circle = tk.Canvas(self.empty_state, width=76, height=76,
                           bg=COLORS['surface'], highlightthickness=0)
        circle.pack()
        self._es_circle_img = make_gradient_image(
            76, 76, COLORS['gradient_start'], COLORS['gradient_end'], shape='ellipse')
        circle.create_image(0, 0, anchor='nw', image=self._es_circle_img)
        if self.microphone_icon is not None:
            circle.create_image(38, 38, image=self.microphone_icon)
        else:
            circle.create_text(38, 38, text='🎙', font=('Segoe UI', 20),
                               fill=COLORS['on_primary'])

        tk.Label(self.empty_state, text='Start a new screening',
                 font=('Segoe UI', 16, 'bold'), fg=COLORS['text'],
                 bg=COLORS['surface']).pack(pady=(16, 4))
        tk.Label(self.empty_state,
                 text='Click "New Session", then Record to capture symptoms.',
                 font=('Segoe UI', 12), fg=COLORS['text_secondary'],
                 bg=COLORS['surface']).pack()
        PillButton(self.empty_state, text='+  New Session',
                   command=self.create_new_session, kind='primary',
                   width=190, parent_bg=COLORS['surface']).pack(pady=(18, 0))

    # ------------------------------------------------------------------ #
    #  Status helper (kills hardcoded color literals)                    #
    # ------------------------------------------------------------------ #
    def set_status(self, message, severity='info'):
        fg_key, bg_key = self.SEVERITY.get(severity, self.SEVERITY['info'])
        fg, bg = COLORS[fg_key], COLORS[bg_key]
        glyph = self.GLYPHS.get(severity, 'ℹ')
        self.notification_label.config(text=f"{glyph}  {message}", fg=fg, bg=bg)
        if getattr(self, 'status_dot', None) is not None:
            self.status_dot.delete('all')
            self.status_dot.create_oval(2, 2, 12, 12, fill=fg, outline='')

    def _update_empty_state(self):
        if getattr(self, 'empty_state', None) is None:
            return
        if self.current_session is None:
            self.empty_state.place(relx=0.5, rely=0.44, anchor='center')
            self.empty_state.lift()
        else:
            self.empty_state.place_forget()

    def _reset_action_bar(self):
        """Neutral 'no active session' state: Record is live (it will create a
        session on demand), Analyze is de-emphasized. Prevents dead buttons
        after deleting/clearing the current session."""
        self._read_only = False
        self.record_button.set_enabled(True)
        self.record_button.set_kind('primary')
        self.analyze_button.set_enabled(True)
        self.analyze_button.set_kind('ghost')

    def _set_session_title(self, name=None, read_only=False):
        if name:
            self.session_title.config(text=name)
            if read_only:
                self.readonly_badge.config(text='VIEW ONLY')
                self.readonly_badge.pack(side=tk.LEFT, padx=(12, 0))
            else:
                self.readonly_badge.pack_forget()
        else:
            self.session_title.config(text='Welcome')
            self.readonly_badge.pack_forget()

    # ------------------------------------------------------------------ #
    #  Session folder helpers                                            #
    # ------------------------------------------------------------------ #
    def open_selected_session_folder(self):
        """Open the folder of the currently selected session."""
        try:
            selection = self.sessions_list.curselection()
            if selection:
                session_name = self.sessions_list.get(selection[0]).strip()
                session_path = os.path.abspath(os.path.join(SESSIONS_DIR, session_name))
                if os.path.exists(session_path):
                    self.open_session_folder(session_path)
                else:
                    self.set_status(
                        f"Folder for {session_name} does not exist.", 'error')
            else:
                self.set_status("No session selected to open.", 'warning')
        except Exception as e:
            self.set_status(f"Error opening folder: {e}", 'error')

    def open_session_folder(self, session_path):
        """Open the session folder in the OS file explorer."""
        try:
            if sys.platform == 'win32':
                os.startfile(session_path)  # noqa: P204 (Windows-only)
            elif sys.platform == 'darwin':
                import subprocess
                subprocess.Popen(['open', session_path])
            else:
                import subprocess
                subprocess.Popen(['xdg-open', session_path])
            self.set_status(f"Opened folder: {session_path}", 'success')
        except Exception as e:
            self.set_status(f"Error opening folder: {e}", 'error')

    # ------------------------------------------------------------------ #
    #  Session CRUD                                                      #
    # ------------------------------------------------------------------ #
    def create_new_session(self):
        """Create a new session folder and add it to the session list."""
        try:
            if not os.path.exists(SESSIONS_DIR):
                os.makedirs(SESSIONS_DIR)

            sessions = self.load_sessions() if isinstance(self.load_sessions(), list) else []

            new_index = len(sessions) + 1
            session_name = f"Session_{new_index}"
            session_path = os.path.join(SESSIONS_DIR, session_name)

            os.makedirs(session_path, exist_ok=True)

            sessions.append({
                "name": session_name,
                "path": session_path,
                "created_at": datetime.now().isoformat(),
            })
            self.save_sessions(sessions)

            self.sessions[session_name] = ChatSession(session_name)
            self.sessions_list.insert(tk.END, f"  {session_name}")
            self.sessions_list.selection_clear(0, tk.END)
            self.sessions_list.selection_set(tk.END)
            self.current_session = session_name
            self._set_session_title(session_name, read_only=False)
            self.clear_chat_display()

            self._read_only = False
            self.record_button.set_enabled(True)
            self.record_button.set_kind('primary')
            self.analyze_button.set_enabled(True)
            self.analyze_button.set_kind('ghost')

            self.set_status(f"New session {session_name} created.", 'success')
        except Exception as e:
            self.set_status(f"Error creating session: {e}", 'error')

    def on_session_select(self, event):
        """Handle session selection."""
        try:
            selection = self.sessions_list.curselection()
            if not selection:
                return
            session_name = self.sessions_list.get(selection[0]).strip()
            self.current_session = session_name

            session_path = self.get_current_session_path()
            if not os.path.exists(session_path):
                self.set_status(f"Session {session_name} folder is missing.", 'error')
                return

            self.clear_chat_display()

            transcription_files = [
                f for f in os.listdir(session_path)
                if f.startswith("transcription") and f.endswith(".txt")
            ]
            transcription_files.sort()

            for transcription_file in transcription_files:
                transcription_path = os.path.join(session_path, transcription_file)
                with open(transcription_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
                self.chat_display.insert(tk.END, f"{transcription_file}\n", 'label')
                self.chat_display.insert(tk.END, f"{content}\n")
                self.chat_display.insert(tk.END, "─" * 60 + "\n", 'divider')
            self.chat_display.see(tk.END)

            existing_audio = [
                f for f in os.listdir(session_path)
                if f.startswith("output") and f.endswith(".wav")
            ]
            if transcription_files or existing_audio:
                self._read_only = True
                self.record_button.set_enabled(False)
                self.analyze_button.set_enabled(False)
                self._set_session_title(session_name, read_only=True)
                self.set_status(
                    "Analyzed session — view only (recording is disabled).", 'warning')
            else:
                self._read_only = False
                self.record_button.set_enabled(True)
                self.record_button.set_kind('primary')
                self.analyze_button.set_enabled(True)
                self.analyze_button.set_kind('ghost')
                self._set_session_title(session_name, read_only=False)
                self.set_status(f"Session {session_name} selected.", 'info')
        except Exception as e:
            self.set_status(f"Error: {e}", 'error')

    def load_sessions(self):
        """Load session metadata from sessions.json."""
        if os.path.exists(SESSIONS_FILE):
            try:
                with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except json.JSONDecodeError:
                return []
        return []

    def save_sessions(self, sessions):
        """Save session metadata to sessions.json."""
        with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(sessions, f, indent=4)

    def load_session_messages(self, session_name):
        """Load messages for the selected session."""
        self.clear_chat_display()
        if session_name in self.sessions:
            for message in self.sessions[session_name].messages:
                self.chat_display.insert(tk.END, message)

    # ------------------------------------------------------------------ #
    #  Recording                                                         #
    # ------------------------------------------------------------------ #
    def toggle_recording(self):
        """Toggle between starting and stopping recording."""
        try:
            if not self.is_recording:
                if self._read_only:
                    self.set_status(
                        "Recording is disabled for an analyzed session.", 'warning')
                    return
                if not self.current_session or not os.path.exists(self.get_current_session_path()):
                    self.create_new_session()
                self.start_recording()
            else:
                self.stop_recording()
        except Exception as e:
            self.set_status(f"Error: {e}", 'error')

    def start_recording(self):
        """Start audio recording."""
        try:
            try:
                from audio_handler import AudioRecorder
            except Exception:
                self.set_status(
                    "Audio libraries (vosk / pyaudio) are not installed — "
                    "install requirements.txt to record.", 'error')
                return

            if self.recorder is None:
                self.recorder = AudioRecorder()

            session_path = self.get_current_session_path()
            if not os.path.exists(session_path):
                os.makedirs(session_path)

            existing_transcripts = [
                f for f in os.listdir(session_path)
                if f.startswith("transcription") and f.endswith(".txt")
            ]
            new_file_index = len(existing_transcripts) + 1

            self.recorder.filename = os.path.join(session_path, f"output{new_file_index}.wav")
            self.transcription_file = os.path.join(session_path, f"transcription{new_file_index}.txt")

            self.recorder.start_recording()
            self.is_recording = True
            threading.Thread(target=self.recorder.record, daemon=True).start()

            self.record_button.set_text('Stop')
            self.record_button.set_kind('record_active')
            self._start_rec_indicator()
            self.set_status("Recording… speak now, then press Stop.", 'recording')
        except Exception as e:
            self.set_status(f"Error: {e}", 'error')

    def stop_recording(self):
        """Stop audio recording and save transcription."""
        try:
            if not self.current_session:
                self.set_status("No active session. Cannot stop recording.", 'error')
                return

            if self.recorder is not None:
                self.recorder.stop_recording()
            self.is_recording = False
            self.record_button.set_text('Record')
            self.record_button.set_kind('primary')
            self._stop_rec_indicator()

            try:
                from audio_handler import transcribe_audio
            except Exception:
                self.set_status(
                    "Recording saved, but transcription needs vosk installed.", 'warning')
                return

            self.set_status("Transcribing… this can take a few seconds.", 'info')
            self.root.update_idletasks()
            transcription = transcribe_audio(self.recorder.filename)

            # No speech → don't write a blank transcript (which would otherwise
            # lock the session to view-only with nothing to analyze).
            if not transcription.strip():
                self.set_status(
                    "No speech detected — please try recording again.", 'warning')
                return

            session_path = self.get_current_session_path()
            transcription_files = [
                f for f in os.listdir(session_path)
                if f.startswith("transcription") and f.endswith(".txt")
            ]
            new_file_index = len(transcription_files) + 1
            transcription_path = os.path.join(session_path, f"transcription{new_file_index}.txt")
            with open(transcription_path, "w", encoding="utf-8") as f:
                f.write(transcription)

            self.chat_display.insert(tk.END, "Transcription\n", 'label')
            self.chat_display.insert(tk.END, f"{transcription}\n")
            self.chat_display.see(tk.END)
            self.analyze_button.set_kind('primary')   # promote: a transcript now exists
            self.set_status("Recording stopped. Transcription saved.", 'success')
        except Exception as e:
            self.set_status(f"Error: {e}", 'error')

    def get_current_session_path(self):
        """Get the folder path of the current session."""
        if not self.current_session:
            raise ValueError("No session is currently active.")

        session_path = os.path.join(SESSIONS_DIR, self.current_session)
        if not os.path.exists(session_path):
            os.makedirs(session_path, exist_ok=True)
            self.set_status(f"Recreated session folder: {self.current_session}", 'info')
        return session_path

    # ---- recording indicator (REC chip: blinking dot + elapsed timer) ----
    def _draw_rec_chip(self):
        c = self.rec_chip
        c.delete('all')
        w, h = 124, 34
        draw_round_rect(c, 1, 4, w - 1, h - 4, 13,
                        fill=COLORS['danger_bg'], outline=COLORS['recording_pulse'])
        dot_fill = COLORS['recording_pulse'] if self._dot_on else COLORS['danger_bg']
        c.create_oval(14, h // 2 - 4, 22, h // 2 + 4, fill=dot_fill, outline='')
        mins, secs = divmod(self._elapsed, 60)
        c.create_text(32, h // 2, anchor='w', text=f"REC {mins:02d}:{secs:02d}",
                      fill=COLORS['recording_pulse'], font=('Segoe UI', 10, 'bold'))

    def _start_rec_indicator(self):
        self._elapsed = 0
        self._dot_on = True
        self.rec_chip.pack(side=tk.RIGHT, padx=(0, 12))
        self._draw_rec_chip()
        self._blink_job = self.root.after(600, self._blink_rec)
        self._tick_job = self.root.after(1000, self._tick_rec)

    def _blink_rec(self):
        if not self.is_recording:
            return
        self._dot_on = not self._dot_on
        self._draw_rec_chip()
        self._blink_job = self.root.after(600, self._blink_rec)

    def _tick_rec(self):
        if not self.is_recording:
            return
        self._elapsed += 1
        self._draw_rec_chip()
        self._tick_job = self.root.after(1000, self._tick_rec)

    def _stop_rec_indicator(self):
        for job in ('_blink_job', '_tick_job'):
            handle = getattr(self, job, None)
            if handle is not None:
                try:
                    self.root.after_cancel(handle)
                except Exception:
                    pass
                setattr(self, job, None)
        self.rec_chip.pack_forget()

    # ------------------------------------------------------------------ #
    #  Analysis (AI model untouched — display layer only)                #
    # ------------------------------------------------------------------ #
    def analyze(self):
        """Analyze the transcription and predict diseases."""
        try:
            if not self.current_session:
                self.set_status("No active session for analysis.", 'error')
                return

            session_path = self.get_current_session_path()
            transcription_files = [
                f for f in os.listdir(session_path)
                if f.startswith("transcription") and f.endswith(".txt")
            ]
            if not transcription_files:
                self.set_status("No transcription file found for analysis.", 'error')
                return

            transcription_file = os.path.join(session_path, sorted(transcription_files)[-1])
            with open(transcription_file, "r", encoding="utf-8", errors="replace") as f:
                transcription = f.read().strip()

            if not transcription:
                self.set_status("Transcription is empty. Cannot analyze.", 'error')
                return

            try:
                from predictor import predict_disease
            except Exception:
                self.set_status(
                    "Prediction model needs TensorFlow installed to analyze.", 'error')
                return

            self.set_status("Analyzing transcription…", 'info')
            self.root.update_idletasks()

            # --- AI boundary: predict_disease is called verbatim ---
            predictions = predict_disease(transcription)
            result = "\n".join([f"{disease}: {prob:.2%}" for disease, prob in predictions])

            # Persist exactly as before (byte-identical text format)
            with open(transcription_file, "a", encoding="utf-8") as f:
                f.write(f"\n\nAnalysis Result:\n{result}")

            # Display: heading + visual confidence cards
            self.chat_display.insert(tk.END, "Analysis Result\n", 'label')
            self._render_confidence(predictions)
            self.chat_display.see(tk.END)
            self.set_status("Analysis complete.", 'success')

            self._read_only = True
            self.record_button.set_enabled(False)
            self.analyze_button.set_enabled(False)
            self._set_session_title(self.current_session, read_only=True)
        except Exception as e:
            self.set_status(f"Error: {e}", 'error')

    def _render_confidence(self, predictions):
        """Render top predictions as confidence cards inside the transcript."""
        width = max(360, self.chat_display.winfo_width() - 64)
        for rank, (disease, prob) in enumerate(predictions, start=1):
            card = ConfidenceCard(self.chat_display, disease, prob, rank,
                                  width, COLORS['surface'])
            self.chat_display.window_create(tk.END, window=card)
            self.chat_display.insert(tk.END, "\n")
            self._result_cards.append(card)
        self.chat_display.insert(tk.END, "\n")

    def _on_chat_resize(self, _event):
        if not self._result_cards:
            return
        width = max(360, self.chat_display.winfo_width() - 64)
        for card in list(self._result_cards):
            try:
                card.config(width=width)
                card.redraw()
            except tk.TclError:
                self._result_cards.remove(card)

    # ------------------------------------------------------------------ #
    #  Delete / clear (with confirmation)                                #
    # ------------------------------------------------------------------ #
    def delete_selected_session(self):
        """Delete the currently selected session and its data."""
        selection = self.sessions_list.curselection()
        if not selection:
            self.set_status("No session selected to delete.", 'warning')
            return

        session_name = self.sessions_list.get(selection[0]).strip()
        if not messagebox.askyesno(
            "Delete session?",
            f"This permanently removes the recording, transcript and analysis "
            f"for {session_name}.\n\nThis cannot be undone."):
            return

        session_path = os.path.join(SESSIONS_DIR, session_name)
        if os.path.exists(session_path):
            import shutil
            shutil.rmtree(session_path)

        self.sessions.pop(session_name, None)
        self.sessions_list.delete(selection[0])

        if self.current_session == session_name:
            self.current_session = None
            self._reset_action_bar()
            self._set_session_title(None)
            self.clear_chat_display()
        self.set_status(f"Session {session_name} deleted.", 'warning')

        self.save_sessions([
            {"name": name, "path": os.path.join(SESSIONS_DIR, name)}
            for name in self.sessions
        ])

    def clear_all_sessions(self):
        """Clear all sessions from UI and filesystem."""
        if self.sessions_list.size() == 0:
            self.set_status("There are no sessions to clear.", 'info')
            return
        if not messagebox.askyesno(
            "Clear all sessions?",
            "This permanently removes ALL recordings, transcripts and analyses.\n\n"
            "This cannot be undone."):
            return

        import shutil
        if os.path.exists(SESSIONS_DIR):
            shutil.rmtree(SESSIONS_DIR)
        os.makedirs(SESSIONS_DIR)
        self.sessions.clear()
        self.sessions_list.delete(0, tk.END)
        self.current_session = None
        self._reset_action_bar()
        self._set_session_title(None)
        self.save_sessions([])
        self.clear_chat_display()
        self.set_status("All sessions cleared.", 'warning')

    def clear_chat_display(self):
        """Clear the chat display area."""
        self.chat_display.delete('1.0', tk.END)
        self._result_cards = []
        self._update_empty_state()


def _apply_frozen_cwd():
    """When packaged as a PyInstaller bundle, switch the working directory to
    the bundle root so the app's relative paths (./models, ./ui, ./data,
    ./sessions.json) resolve. No-op when run from source. This only changes
    *where files are found* — predictor.py / audio_handler.py are untouched."""
    if getattr(sys, 'frozen', False):
        base = getattr(sys, '_MEIPASS', None) or os.path.dirname(sys.executable)
        try:
            os.chdir(base)
        except Exception:
            pass


def _run_selftest():
    """Headless smoke test of the bundled AI pipeline (no GUI), used to verify a
    packaged .exe can load the model and predict. Run: SymptomsEaseAI.exe --selftest"""
    try:
        from predictor import predict_disease
        sample = "i have a cough sore throat runny nose fever and chest congestion"
        preds = predict_disease(sample)
        print("SELFTEST input:", sample)
        for disease, prob in preds:
            print(f"  -> {disease}: {prob:.2%}")
        print("SELFTEST_OK")
        return 0
    except Exception as e:  # noqa: BLE001
        print("SELFTEST_FAILED:", repr(e))
        return 1


def main():
    """Initialize and run the application"""
    _apply_frozen_cwd()
    if "--selftest" in sys.argv:
        raise SystemExit(_run_selftest())
    root = tk.Tk()
    app = DiseasesEaseApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
