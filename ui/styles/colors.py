# colors.py - "Midnight Violet" theme (purple -> blue), dark mode.
#
# A polished dark palette: deep indigo canvas, slightly lighter violet-tinted
# cards, a violet -> blue gradient for primary actions, and clear semantic
# status colors. All text/background pairs are tuned for comfortable contrast.
#
# The ORIGINAL keys are preserved (re-tinted for the dark violet theme) so any
# existing reference keeps working; new design tokens are added below them.

COLORS = {
    # --- original keys (kept; re-tinted for the Midnight Violet theme) ---
    'background':       '#16131F',  # deep indigo-black app canvas (cards float on this)
    'sidebar':          '#1E1A2B',  # violet-tinted sidebar card
    'primary':          '#8B5CF6',  # violet primary (buttons, selection accent)
    'primary_dark':     '#7C3AED',  # darker violet for hover (legacy key kept)
    'text':             '#ECEAF6',  # near-white ink for body text (~15:1 on bg)
    'text_secondary':   '#B7B1CE',  # secondary ink (~7:1 on surface)
    'header_bg':        '#1E1A2B',  # header strip (matches sidebar card)
    'scrollbar':        '#3A3450',  # muted violet-gray scrollbar thumb
    'scrollbar_active': '#4A4366',  # brighter thumb on hover/active

    # --- surfaces & structure ---
    'surface':          '#241F33',  # card surface (chat document, result cards)
    'surface_alt':      '#2E2842',  # hover / selected list row / chip
    'border':           '#322C46',  # 1px card borders & dividers
    'bar_track':        '#2A2540',  # confidence-bar empty track

    # --- brand / accents (purple -> blue) ---
    'primary_hover':    '#9B72F9',  # brighter violet on hover (dark theme lifts)
    'primary_active':   '#6D34D6',  # pressed state
    'accent_blue':      '#60A5FA',  # blue accent / info / large % readout
    'accent_violet':    '#A78BFA',  # secondary violet accent
    'gradient_start':   '#8B5CF6',  # hero pill / rank-1 bar gradient start (violet)
    'gradient_end':     '#3B82F6',  # hero pill / rank-1 bar gradient end (blue)

    # --- text extras ---
    'text_muted':       '#8E87A8',  # disclaimer, placeholders, captions
    'on_primary':       '#FFFFFF',  # text on violet/gradient buttons

    # --- semantic status (text + tinted toast background pairs) ---
    'success':          '#4ADE80',  # success text (was '#00FF00')
    'success_bg':       '#16281C',  # success toast tint (dark green)
    'info':             '#7CB0FF',  # info / selected text
    'info_bg':          '#172339',  # info toast tint (dark blue)
    'warning':          '#FBBF24',  # warning / view-only text (was 'orange')
    'warning_bg':       '#2A2210',  # warning toast tint (dark amber)
    'danger':           '#F87171',  # error / delete / record text (was 'red')
    'danger_bg':        '#2A1620',  # danger toast tint (dark red)
    'recording_pulse':  '#FB4D5E',  # blinking record indicator dot

    # --- confidence bars ---
    'confidence_top':   '#8B5CF6',  # rank #1 fill (receives the full violet->blue gradient)
    'confidence_second':'#6E5FB0',  # rank #2 fill (softer violet so #1 dominates)
}
