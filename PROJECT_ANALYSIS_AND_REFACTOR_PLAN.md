# SymptomsEase AI — Project Analysis & Refactor Plan

> **What this document is.** A complete, evidence-backed analysis of the SymptomsEase AI desktop
> application, plus a full plan to (a) make it **downloadable from a website and runnable locally**
> on a user's computer, and (b) **refactor the whole app without touching the AI model**.
>
> **How it was produced.** 12 AI agents working in parallel: 5 analysis agents (Overview, UI, Voice,
> Security, Code), 5 adversarial verifiers that re-read the actual source to confirm or correct every
> finding, 1 distribution-research agent, and 1 completeness critic. Every claim below cites a real
> `file:line`.
>
> **Hard rule honored throughout:** the **AI model is OFF-LIMITS**. The prediction algorithm in
> `predictor.py` and all model artifacts (`trained_model.h5`, `scaler.pkl`, `features.pkl`, the Vosk
> model, `Modified_EDA.ipynb`) stay **byte-for-byte unchanged**. Every recommendation that comes near
> them changes only *how files are located/loaded/cached*, never the math.
>
> _Generated: 2026-06-17 • No source code was modified to produce this report._

---

## Table of Contents

1. [Executive Summary (read this first)](#1-executive-summary-read-this-first)
2. [What Is This Project](#2-what-is-this-project)
3. [How It Works (Architecture & Runtime Flow)](#3-how-it-works-architecture--runtime-flow)
4. [⛔ The AI Side — Do Not Touch](#4--the-ai-side--do-not-touch)
5. [Findings by Dimension](#5-findings-by-dimension)
   - [5.1 UI / UX](#51-ui--ux)
   - [5.2 Voice Detection / Audio](#52-voice-detection--audio)
   - [5.3 Security & Privacy](#53-security--privacy)
   - [5.4 Code Quality & Maintainability](#54-code-quality--maintainability)
6. [Cross-Cutting Issues & Hidden Gaps](#6-cross-cutting-issues--hidden-gaps)
7. [Distribution: Download via Website, Run Locally](#7-distribution-download-via-website-run-locally)
8. [The Whole Refactor Plan (AI-Safe)](#8-the-whole-refactor-plan-ai-safe)
9. [The Refactor Workflow — New Agent Team & Orchestration](#9-the-refactor-workflow--new-agent-team--orchestration)
10. [Appendix: Full Findings Tables](#10-appendix-full-findings-tables)

---

## 1. Executive Summary (read this first)

SymptomsEase AI is a **Windows-first Python 3.9 Tkinter desktop app** that records a patient's voice,
transcribes it offline with **Vosk**, and feeds the transcript into a **Keras neural network** that
returns the **top-2 of 7 disease categories** with confidence scores. It works and the AI is solid
(95% reported accuracy). The problems are almost entirely *around* the model: portability, packaging,
privacy, UI feedback, and code hygiene.

### 🔴 The single most urgent thing

**Real patient data is already public.** The verifier ran `git ls-files` and confirmed that patient
audio (`data/sessions/Session_1..6/*.wav`), transcriptions, and `sessions.json` are **committed and
pushed to a public GitHub remote** (`github.com/FerasAlkhodari/SymptomsEaseAi`) with **no `.gitignore`**.
`Session_6/transcription1.txt` contains a **real person's name**. This is a live, ongoing data breach —
fix it before anything else.

### Top 10 priorities (verified, ranked by realized harm × blocks-distribution × effort)

| # | Priority | Dimension | Touches AI? | Effort |
|---|----------|-----------|:---:|:---:|
| 1 | **Purge committed PHI from git history + add `.gitignore`** (active breach) | Security | No | M |
| 2 | **Fix hardcoded `./` paths** with one `resource_path()` resolver (keystone — blocks packaging) | Code/Dist | Load-path only | M |
| 3 | **Add an in-app medical disclaimer** (startup modal + beside every result) | UI/Legal | No | S |
| 4 | **Move writable PHI to `%LOCALAPPDATA%`** (install dir is read-only → app crashes post-install) | Security/Dist | No | M |
| 5 | **SHA-256 integrity check before loading model/pickles + ship one canonical `models/` copy** | Security | Load-path only | M |
| 6 | **Move STT + inference to a worker thread; load Vosk once** (UI freezes today) | UI/Voice | No | M |
| 7 | **Resolve Vosk/TensorFlow license & attribution** before publishing (MIT bundle of Apache-2.0 model) | Legal gap | No | S |
| 8 | **Add a file logger under `%LOCALAPPDATA%`; replace 21 `print()` calls** (GUI exe has no console) | Code/Dist | No | M |
| 9 | **Fix audio-path correctness bugs**: empty-audio guard, start/stop index desync, use-after-`terminate()` | Voice | No | S–M |
| 10 | **Reconcile docs & deps; delete dead/duplicate code** (README is fictional; `RADME.md` duplicate) | Code/Docs | No | S |

> **Every AI-touching item (#2, #5) changes only file *location/integrity*, never the bag-of-words →
> `scaler.transform` → `model.predict` → `argsort` algorithm.** The model bytes never change.

---

## 2. What Is This Project

**SymptomsEase AI** (a.k.a. *DiseasesEaseAI* in some files) is a graduation / senior project from the
**University of Jeddah**. It is an **audio-based health-screening desktop application**:

- A clinician or patient **records a short spoken description of symptoms**.
- The app **transcribes** that speech to text **fully offline** (no internet required).
- A trained **neural network classifies** the transcript into one of **7 disease categories** and shows
  the **two most likely** with confidence percentages.

The seven categories (`predictor.py:25-33`):

| Class | Disease |
|---|---|
| 1 | Upper Respiratory Tract Infection |
| 2 | Dermatitis |
| 3 | Gastritis |
| 4 | Rhinitis |
| 5 | Viral Hepatitis |
| 6 | Enteritis |
| 7 | Pneumonia |

> ⚠️ **It is an academic proof-of-concept, not a medical device.** The README says so
> (`README.md:44`) — but, critically, the **running app shows no disclaimer at all** (see UX-01 / SEC-10).

**Tech stack (what the code actually uses, not what the README claims):**

| Layer | Technology |
|---|---|
| Language / Runtime | Python 3.9 |
| GUI | Tkinter + `ttk` (+ Pillow for icons) |
| Voice capture | PyAudio (PortAudio) |
| Speech-to-text | **Vosk** offline model (`vosk-model-small-en-us-0.15`, ~68 MB) |
| Classifier | **Keras / TensorFlow 2.9.1** neural net (`trained_model.h5`) |
| Feature prep | bag-of-words count vector + `MinMaxScaler` (scikit-learn) |
| Storage | JSON index (`sessions.json`) + per-session folders of `.wav` + `.txt` |

> 📌 **Doc warning:** the top half of `README.md` describes a *completely different, fictional* project
> (a Librosa/MFCC scikit-learn pipeline with `src/train.py`, `src/predict.py`, etc.) that **does not
> exist**. The **lower half** ("🤖 AI Model Details") **is accurate**. See OVW-1 / CQ-10.

---

## 3. How It Works (Architecture & Runtime Flow)

### 3.1 Component map

```
┌──────────────────────────────────────────────────────────────────────┐
│  ui_main.py  —  class DiseasesEaseApp  (~600 lines, the "god object")  │
│  window • styling • session CRUD • sessions.json I/O • orchestration   │
│  entry point: main()  ui_main.py:617-624  (tk.Tk → app → mainloop)     │
└───────────────┬───────────────────────┬──────────────────────────────┘
                │ records / transcribes  │ predicts
                ▼                         ▼
   ┌───────────────────────┐   ┌──────────────────────────────┐
   │ audio_handler.py      │   │ predictor.py  ⛔ AI BOUNDARY  │
   │ AudioRecorder (PyAudio)│   │ predict_disease(transcription)│
   │ transcribe_audio(Vosk) │   │ bag-of-words → scaler → model │
   └──────────┬────────────┘   └───────────────┬──────────────┘
              │ loads (every call!)             │ loads at IMPORT time
              ▼                                 ▼
   models/vosk-model-small-en-us-0.15/   models/trained_model.h5
                                         models/scaler.pkl
                                         models/features.pkl
```

### 3.2 The end-to-end runtime sequence

1. **Launch** → `main()` creates the Tk root and `DiseasesEaseApp` (`ui_main.py:617-624`). Because
   `ui_main.py:12` does `from predictor import predict_disease`, the **entire TensorFlow stack + Keras
   model + both pickles load during startup** (import-time side effect, `predictor.py:6-10`) — before
   the window is usable.
2. **New / select session** → creates a folder `data/sessions/Session_N`, appends an entry to
   `sessions.json` (`create_new_session`, `ui_main.py:276-314`).
3. **Record** (toggle button) → `start_recording` (`ui_main.py:411-434`) opens a PyAudio stream and
   spawns a **daemon thread** (`ui_main.py:430`) that appends mic frames in a loop
   (`AudioRecorder.record`, `audio_handler.py:63-71`).
4. **Stop** (same button) → `stop_recording` (`ui_main.py:436-464`): closes the stream, writes
   `outputN.wav`, then **synchronously** calls `transcribe_audio()` **on the UI thread**. That function
   **re-loads the whole 68 MB Vosk model from disk on every call** (`audio_handler.py:82-84`), validates
   the WAV is mono/16-bit/16 kHz, runs Vosk, and writes `transcriptionN.txt`.
5. **Analyze** → `analyze` (`ui_main.py:478-522`) reads the latest transcript and calls
   `predict_disease()` (`predictor.py:12-36`): tokenize → count vector over `features` → `scaler.transform`
   → `model.predict` → `argsort` top-2 → map to disease names. The result is **appended into the same
   `.txt`** and shown in the chat panel; Record/Analyze are then disabled for that session.

### 3.3 Threading model (and why the UI freezes)

Only the **mic capture loop** runs off-thread. The **two expensive operations — Vosk transcription and
`model.predict` — run on the Tk event-loop thread** (`ui_main.py:447` and `:505`), with **no spinner or
progress indicator**, so the window visibly freezes during Stop and Analyze (OVW-6 / UX-02 / AUD-03).

### 3.4 Storage model

- One folder per session under `./data/sessions/Session_N` holding co-located `outputN.wav` +
  `transcriptionN.txt`, indexed by `./sessions.json` (name, path, `created_at`).
- A second, **orphaned** tree `data/session_audio/` exists and is referenced by docs/tests but **no
  production code writes to it** (OVW-8 / CQ-missed).

### 3.5 Architectural observations (not bugs, but they shape the refactor)

| ID | Observation | Where |
|---|---|---|
| OVW-2 / CQ-03 | `DiseasesEaseApp` is a **god object** — UI + persistence + threading + AI formatting all in one ~600-line class | `ui_main.py:24-623` |
| OVW-3 / UX-03 / CQ-04 | `create_sidebar` is **defined twice**; Python keeps the 2nd, silently dropping the "Open Session Folder" button | `ui_main.py:153-206` & `524-570` |
| OVW-4 / CQ-02 | Model + scaler + features load **at import time**, blocking startup | `predictor.py:6-10` |
| OVW-5 (keystone) | **Hardcoded `./` paths** assume the CWD is the project root | `predictor.py:6-10`, `audio_handler.py:76`, `ui_main.py:15-16,33,44` |
| OVW-7 | Vosk model **reloaded from disk on every transcription** | `audio_handler.py:82-84` |
| OVW-10 / CQ-07 | **Duplicate, DRIFTED** model artifacts: root `trained_model.h5` (968,896 B) ≠ `models/` copy (1,409,144 B) | repo root vs `models/` |

---

## 4. ⛔ The AI Side — Do Not Touch

This is the boundary every refactor task must respect. **These stay byte-for-byte identical:**

| Artifact / Code | Why it's off-limits |
|---|---|
| `predictor.py:12-36` — `predict_disease()` + inner `dialog_to_count_vector()` | The actual inference algorithm: bag-of-words vectorization → `scaler.transform([vector])` → `model.predict(...)` → `np.argsort(...)[-2:][::-1]` top-2. |
| `predictor.py:25-33` — the index→disease label map | The label **values** are part of the trained model's contract (class index order is load-bearing). |
| `models/trained_model.h5` | Trained Keras weights. Do not retrain, re-export, or convert. |
| `models/scaler.pkl` | Fitted `MinMaxScaler`. Must not be regenerated. |
| `models/features.pkl` | Ordered vocabulary; **index order is load-bearing** for the count vector. |
| `models/vosk-model-small-en-us-0.15/*` | Offline STT model. Contents untouched. |
| `Modified_EDA.ipynb` | The notebook that produced the model/scaler/features. |

### ✅ What you *may* safely change near the AI (load-path / integrity / caching only)

- **Where** these files are found (replace `./models/...` with a `resource_path()` resolver).
- **When** they load (defer the import-time load behind a cached lazy loader) — *same algorithm, just
  later*.
- **Caching** the Vosk model so it loads once instead of every call.
- **Verifying** their SHA-256 hash before loading (integrity), without altering the bytes.
- **Removing the duplicate root copies** so only the canonical `models/` trio ships.

> 🔒 **Golden-output guarantee:** before/after any AI-adjacent change, feed a fixed transcript through
> `predict_disease()` and assert the returned `(disease, confidence)` pairs are **identical**. If they
> differ, the change crossed the boundary — revert it.

---

## 5. Findings by Dimension

Severity = Critical / High / Medium / Low / Info. Effort = S / M / L. "AI" = recommendation touches the
AI load-path (algorithm still preserved). All findings were re-checked by an adversarial verifier;
corrections are noted.

### 5.1 UI / UX

| ID | Sev | AI | Finding | Location |
|---|:--:|:--:|---|---|
| **UX-01** | 🔴 Critical | – | **No medical disclaimer anywhere** in a disease-screening UI | `ui_main.py:208-249,478-522` |
| UX-02 | 🟠 High | – | Slow transcription + inference **freeze the UI thread** with no spinner / disabled buttons | `ui_main.py:436-464,504-514` |
| UX-03 | 🟠 High | – | Duplicate `create_sidebar` drops the "Open Session Folder" button; dead-code confusion | `ui_main.py:153-206,524-570` |
| UX-04 | 🟡 Med | – | "Rounded/circular" buttons are visually broken (rect Button packed over a drawn oval) | `ui_main.py:251-274` |
| UX-05 | 🟡 Med | – | Results are plain text — **no confidence bars, no ranking emphasis** | `ui_main.py:504-513` |
| UX-06 | 🟡 Med | – | Recording has no prominent indicator; button never changes to "Stop" | `ui_main.py:240-243,411-431` |
| UX-07 | 🟡 Med | – | Fixed 1200×800 window, no `minsize`, not responsive | `ui_main.py:29` |
| UX-08 | 🟢 Low | – | Harsh `#00FF00` status text, poor contrast, hardcoded colors bypass the palette | `ui_main.py:214-218,…` |
| UX-09 | 🟢 Low | – | No keyboard shortcuts/focus order; **destructive deletes have no confirmation** | `ui_main.py:178,240-249` |
| UX-10 | 🟢 Low | – | No empty-state guidance; inconsistent delete feedback | `ui_main.py:53-57,572-600` |
| UX-11 | 🟢 Low | ✅ | Unguarded Windows-only icon + `ctypes.windll` crash on non-Windows/missing asset | `ui_main.py:33-35` |
| *(missed)* | 🟡 Med | – | Chat never auto-scrolls — no `see(tk.END)` after inserts | `ui_main.py:346,460,513` |
| *(missed)* | 🟢 Low | – | `notification_label` bg (`#1e1e1e`) mismatches parent (`#2b2b2b`) → visible seam | `ui_main.py:210,214-218` |
| *(missed)* | 🟢 Low | – | Loaded mic icon + `create_circular_button` are **dead UI code** | `ui_main.py:44,251-261` |

**How we can improve the UI (concrete):**

1. **Persistent disclaimer** — a non-dismissable banner ("For educational screening only. Not a medical
   diagnosis. Consult a licensed physician.") + a one-time startup modal + a disclaimer line prefixing
   every result block.
2. **Responsiveness feedback** — run STT/inference on a worker thread (§5.2/§8) and show an indeterminate
   `ttk.Progressbar` / "Transcribing…" label while disabling Record/Analyze; re-enable on completion.
3. **Result panel** — bold/large top prediction + a horizontal **confidence bar** per disease + a muted
   secondary style for #2. *(Display only — `predict_disease` values never change.)*
4. **Recording state** — toggle the button to "Stop", add a pulsing red dot + elapsed-time counter.
5. **Responsive layout** — `root.minsize(900,600)`, center on screen, `ttk.PanedWindow` split, expanding
   listbox.
6. **Accessibility & safety** — WCAG-contrast success color (e.g. `#4caf50`) centralized in
   `ui/styles/colors.py`; keyboard accelerators (Ctrl+R record, Ctrl+N new, Del delete); **confirmation
   dialogs** before `delete_selected_session` / `clear_all_sessions` (which `shutil.rmtree` with no prompt).
7. **Polish** — `chat_display.see(tk.END)` after each insert; fix the bg seam; remove or wire up the dead
   mic-icon affordance; one consistent button style.

### 5.2 Voice Detection / Audio

| ID | Sev | AI | Finding | Location |
|---|:--:|:--:|---|---|
| AUD-01 | 🟠 High | – | **Mic device index hardcoded to 0**, no device picker → fails/records silence on many PCs | `audio_handler.py:10-12,30` |
| AUD-02 | 🟠 High | – | **No voice-activity/silence handling** — silence still produces a transcript *(verifier: empty IS guarded in `analyze` at `ui_main.py:500`, so downgraded to partial; the no-speech UX gap is real)* | `audio_handler.py:63-71` |
| AUD-03 | 🟡 Med | – | **Vosk model reloaded on every transcription** → multi-second freeze each Stop | `audio_handler.py:74-84` |
| AUD-04 | 🟡 Med | – | **Race:** `stop_recording` closes the stream while the record thread may still be reading it (no `join`) | `audio_handler.py:40-50,63-71` |
| AUD-05 | 🟡 Med | – | WAV written before record thread flushes → last frames / whole file may be empty | `audio_handler.py:52-57` |
| AUD-06 | 🟡 Med | – | No gain/AGC or input-level feedback; clipping/low-level audio silently hurts STT | `audio_handler.py:25-32,63-68` |
| AUD-07 | 🟡 Med | – | Capture fixed at 16 kHz, **no fallback/resample** if device rejects it | `audio_handler.py:17,25-32` |
| AUD-08 | 🟢 Low | – | Errors only `print`/re-raised; raw exception text shown to users | `audio_handler.py:36-38,117-122` |
| AUD-09 | 🟡 Med | ✅ | Hardcoded `./models` Vosk path breaks when CWD ≠ project root | `audio_handler.py:76` |
| AUD-10 | 🟢 Low | – | Only final results used; no live partial transcription feedback | `audio_handler.py:100-113` |
| **(missed)** | 🟠 High | – | **Use-after-terminate bug:** `p.terminate()` (`:50`) runs *before* `p.get_sample_size()` (`:55`) | `audio_handler.py:50,55` |
| *(missed)* | 🟡 Med | – | `stop_recording` writes blank transcription + reports success (no empty guard) | `ui_main.py:447-461` |
| *(missed)* | 🟢 Low | – | Record thread fire-and-forget; no re-entrancy guard against double-start | `ui_main.py:411-430` |

**How we can improve voice detection (concrete):**

1. **Device selection** — default `device_index=None` (system default), enumerate input devices
   (`maxInputChannels>0`) and let the user pick; validate 16 kHz mono int16 with `is_format_supported`.
2. **VAD / no-speech** — add `webrtcvad` or an RMS energy threshold over captured frames; if no speech
   detected, surface "No speech detected — please try again" and **do not** persist/analyze.
3. **Load Vosk once** — module-level singleton or cache it in `AudioRecorder`; create a fresh
   `KaldiRecognizer` per file. *(Removes the per-Stop freeze; STT output unchanged.)*
4. **Fix the lifecycle bugs** — compute `get_sample_size()` **before** `terminate()` (or `setsampwidth(2)`
   for fixed `paInt16`); keep a thread reference and `join()` it before closing the stream; guard against
   re-entrant `start_recording`.
5. **Input conditioning** — live VU/level meter; warn on sustained clipping (peak ≈ 32767) or very low
   RMS; optional normalization/AGC **upstream of the WAV** (preserves the mono/16-bit/16 kHz invariant).
6. **Resampling fallback** — if 16 kHz unsupported, capture native (44.1/48 kHz) and resample with
   `audioop.ratecv` before writing.
7. **Live feedback (optional)** — stream chunks into a recognizer during recording and show
   `PartialResult()` so users see speech is being captured.

> All of the above is **upstream of the classifier**. The disease model's inputs/outputs are unchanged.

### 5.3 Security & Privacy

> This app handles **PHI-like health data** (voice + transcripts + disease predictions). Treat accordingly.

| ID | Sev | AI | Finding | Location |
|---|:--:|:--:|---|---|
| **(missed)** | 🔴 **Critical** | – | **PHI ALREADY committed & pushed to a PUBLIC GitHub remote** — patient `.wav`, transcripts (a **real name** in `Session_6`), and `sessions.json`. Active breach. | `git ls-files` (whole `data/` tree + `sessions.json`) |
| SEC-01 | 🔴 Critical | ✅ | **Untrusted `pickle.load`** of `scaler.pkl`/`features.pkl` = code execution if the file is swapped (user-writable / MITM / supply-chain) | `predictor.py:7-10` |
| *(missed)* | 🟠 High | ✅ | **`load_model('trained_model.h5')` is also a deserialization sink** (HDF5/Keras Lambda layers can run code on load) | `predictor.py:6` |
| SEC-02 | 🟠 High | – | **Plaintext PHI at rest** — audio + transcripts + predictions, no encryption, no retention, no secure delete | `ui_main.py:456-457,509-510` |
| SEC-03 | 🟠 High | – | **No `.gitignore`** → the live patient tree & `sessions.json` get tracked/pushed | (repo root) |
| SEC-04 | 🟠 High | – | **Path traversal / arbitrary read** — `path` field from `sessions.json` used directly in `open()`/`os.startfile` *(verifier: real for the JSON-driven read; sanitize before any open)* | `ui_main.py:59-68,129,147` |
| SEC-05 | 🟡 Med | ✅ | Hardcoded relative paths break under distribution | `predictor.py:6-10`, `audio_handler.py:76`, `ui_main.py:15-16` |
| SEC-06 | 🟡 Med | ✅ | No code signing, no model/file integrity check, no hash-pinned deps, no auto-update for security patches | `requirements.txt:1-8` |
| SEC-07 | 🟡 Med | – | **PHI leaked to stdout** — full transcription + absolute paths printed | `audio_handler.py:111,114`, `ui_main.py:148` |
| SEC-08 | 🟢 Low | ✅ | Unbounded transcription size fed to the vectorizer | `ui_main.py:497-505` |
| SEC-09 | 🟢 Low | ✅ | Duplicate AI artifacts (root + `models/`) enlarge the tamper surface | `predictor.py:6-10` |
| SEC-10 | ℹ️ Info | – | No in-app medical disclaimer (compliance/liability) | `ui_main.py:214-218` |
| *(missed)* | 🟢 Low | – | `untitled_project/trial_*/checkpoint.weights.h5` tuner artifacts committed (extra HDF5 surface) | git-tracked |
| *(missed)* | 🟡 Med | – | Raw `raw_data(in) (2).csv` (3.2 MB) committed — possible source-text/licensing exposure | git-tracked |

**How we enhance security (concrete, AI-safe):**

1. **Containment first (do today):** add `.gitignore` (`data/`, `sessions.json`, `*.wav`, session `*.txt`,
   `__pycache__/`, `untitled_project/`); **purge history** with `git filter-repo`/BFG; force-push; assume
   the public data is already cloned (so notify/rotate as appropriate).
2. **Integrity before load:** pin and verify a **SHA-256 hash** of `trained_model.h5`, `scaler.pkl`,
   `features.pkl`, and the Vosk dir before loading; ship them **read-only** inside a **signed** bundle;
   keep a **single canonical `models/` copy** and delete the drifted root duplicates. *(Load-path only.)*
3. **Encrypt PHI at rest:** per-user key from the OS keystore/DPAPI; secure-delete that overwrites;
   retention/auto-cleanup policy; **consent capture** before recording.
4. **Sanitize paths:** never trust `path` from JSON — derive from a whitelisted session name
   (`[A-Za-z0-9_]`) and assert `os.path.abspath` stays inside the data dir via `os.path.commonpath`.
5. **Stop logging PHI:** remove raw transcription/paths from stdout; gate any diagnostics behind a debug
   flag and a file logger (not the console).
6. **Harden inputs:** cap transcription length/size before `predict_disease`.
7. **Distribution security:** code-sign installer + exe; hash-locked `requirements`; a secure update
   channel; **upgrade off EOL TensorFlow 2.9.1** (see §6 gap).

### 5.4 Code Quality & Maintainability

| ID | Sev | AI | Finding | Location |
|---|:--:|:--:|---|---|
| CQ-01 | 🟠 High | ✅ | Hardcoded relative paths (the keystone issue) | `predictor.py:6-10`, `audio_handler.py:76`, `ui_main.py:15-16,33,44` |
| CQ-02 | 🟠 High | ✅ | Import-time model/scaler/features load | `predictor.py:3-10` |
| CQ-03 | 🟠 High | – | God class `DiseasesEaseApp` | `ui_main.py:24-623` |
| CQ-04 | 🟡 Med | – | Duplicate `create_sidebar` | `ui_main.py:153-206,524-570` |
| CQ-05 | 🟢 Low | – | Dead code: duplicate `datetime` import, unused `create_circular_button`, `load_session_messages` | `ui_main.py:9-10,251-261,387-392` |
| CQ-06 | 🟡 Med | – | **No logging — 21 `print()` calls** (verifier corrected 22→21) | `audio_handler.py` (12) + `ui_main.py` (9) |
| CQ-07 | 🟡 Med | ✅ | Duplicate **DRIFTED** artifacts: root `trained_model.h5`=968,896 B vs `models/`=1,409,144 B | repo root vs `models/` |
| CQ-08 | 🟡 Med | – | Split/unpinned deps; viz deps (`pandas/matplotlib/seaborn/wordcloud`) missing from `requirements.txt` | `requirements_viz.txt` |
| CQ-09 | 🟠 High | ✅ | **Tests don't mock the model**; "performance" tests time the mock and assert nothing real | `tests/test_performance.py:5-33` |
| CQ-10 | 🟢 Low | – | Conflicting `README.md` vs `RADME.md` | `RADME.md` |
| CQ-11 | 🟢 Low | – | Committed build/tuning artifacts + `__pycache__`, no `.gitignore` | `untitled_project/` |
| CQ-12 | 🟢 Low | ✅ | Disease label map rebuilt per-call + duplicated in tests (de-dup must preserve exact values) | `predictor.py:25-33` |
| CQ-13 | 🟢 Low | – | Sparse type hints project-wide | (all modules) |
| *(missed)* | 🟡 Med | – | Same transcription-enumeration list-comp **copy-pasted in 5 methods** | `ui_main.py:336,419,451,488,350` |
| *(missed)* | 🟡 Med | – | **`open()` uses platform default encoding** (cp1252 on Windows) → `UnicodeDecodeError` on non-ASCII | `ui_main.py:70,344,375,384,456,497,509` |
| *(missed)* | 🟡 Med | – | Unconditional Windows-only `ctypes.windll` / `os.startfile` break cross-platform import | `ui_main.py:35,147` |

**How we improve the code (concrete, AI-safe):**

1. **One `resource_path()` resolver** (`sys._MEIPASS`/`__file__`) → replace every `./...` literal.
2. **Lazy cached loaders** (`functools.lru_cache`) for model/scaler/features so import has no side
   effects — **same algorithm, deferred load**.
3. **Extract a `SessionManager` service** (load/save/create/delete sessions, path resolution, run
   transcribe+predict) so logic is **headless-testable**; `DiseasesEaseApp` becomes a thin view.
4. **Delete dead/duplicate code** (2nd `create_sidebar`, duplicate import, unused methods, dead canvas
   buttons); extract the repeated transcription-enumeration into one helper.
5. **Add structured logging** to a file under `%LOCALAPPDATA%` with levels; replace `print()`.
6. **Pin & consolidate deps** (base + `[viz]`/`[dev]` extras; pin `pytest`, `numpy`, viz deps; document the
   required TF/Keras version to load `trained_model.h5`).
7. **`encoding='utf-8'`** on every text `open()`.
8. **Guard platform-specific calls** behind `sys.platform` checks.
9. **Fix the tests** (mock `predict_disease`/`transcribe_audio`; make perf tests hit real code or delete;
   isolate UI tests from PyAudio); add `conftest.py` + a headless CI gate.
10. **Type hints** on public signatures (`def predict_disease(transcription: str) -> list[tuple[str, float]]`)
    + a static checker.

---

## 6. Cross-Cutting Issues & Hidden Gaps

**Issues that span multiple dimensions (fix once, benefit everywhere):**

- **PHI exposure is realized, not hypothetical** — Security + Code + Overview + Distribution. (Top priority #1.)
- **Hardcoded CWD-relative paths** — cited in **every** dimension (OVW-5, UX-11, AUD-09, SEC-05, CQ-01) and the
  #1 packaging blocker. One resolver fixes all of it.
- **No in-app disclaimer** — UX-01 (critical) + SEC-10. Invisible README ≠ disclaimer in a frozen `.exe`.
- **Main-thread blocking of STT + inference** — OVW-6 + UX-02 + AUD-03. One worker-thread fix.
- **Untrusted deserialization of AI artifacts** — SEC-01 (pickles) + the HDF5 sink + drifted duplicates.
- **Duplicate/dead/drifted code & docs** — pervasive copy-paste signals (raises packaging risk).
- **Start/stop filename index desync** — independently surfaced by *two* verifiers; a real latent bug.

**Gaps no single dimension owned (the critic surfaced these):**

| Gap | Why it matters before you ship |
|---|---|
| **Vosk / TensorFlow license & attribution** | Project ships **MIT** but bundles the **Apache-2.0** Vosk model (`Copyright 2020 Alpha Cephei Inc`) with **no NOTICE/attribution**. Publishing the installer = a live licensing violation. |
| **Data-retention / consent / secure-delete** | No retention lifecycle, no consent before recording health audio, `delete` just `rmtree`s. |
| **No logging strategy for a shipped app** | A packaged GUI `.exe` has **no console** → every `print()` vanishes → zero field diagnostics. |
| **Offline-first guarantee is unstated** | The app is fully offline today (a privacy strength). The proposed auto-updater introduces the **first network call** — decide that tradeoff deliberately. |
| **Mic-permission / device first-run UX** | A fresh install where device 0 is invalid / mic denied fails with a raw `Error: {e}` and no recovery path — the most likely real first-launch failure. |
| **TensorFlow 2.9.1 is EOL** | Years past support, known CVEs, no patch path in an app with no updater. |
| **No CI** | Tests need a mic + display + the real model → can't run headless → no regression gate before a public release. |

---

## 7. Distribution: Download via Website, Run Locally

**Goal:** a user visits the project website, clicks **Download**, runs an installer, and the app works
**locally and offline** — no Python, no terminal, no manual model download.

### 7.1 Recommended approach

> **PyInstaller (`--onedir`) → wrap in an Inno Setup installer → serve the signed `setup.exe` from the
> website.** Windows-first (the app already uses Windows-only APIs); native builds for macOS/Linux are
> secondary.

**Why this stack:** best-documented path for Tkinter + TensorFlow + NumPy + scikit-learn + Pillow;
`datas=` cleanly bundles the 68 MB Vosk folder + model/scaler/features + icons and exposes them via
`sys._MEIPASS`; `--onedir` (not `--onefile`) avoids re-extracting hundreds of MB to `%TEMP%` on every
launch and trips AV/SmartScreen far less; Inno Setup is free, scriptable, and produces a familiar signed
`setup.exe`.

### 7.2 Option comparison

| Option | Complexity | Verdict |
|---|:--:|---|
| **PyInstaller `--onedir` + Inno Setup** | Medium | ✅ **Recommended** — best support for this exact stack |
| cx_Freeze + MSI | Medium | IT-friendly MSI, but weaker TF support, more manual tuning |
| Nuitka `--standalone --onefile` | High | TF 2.9.1 is very hard under Nuitka; fragile, slow builds |
| Briefcase (BeeWare) | High | Targets Toga, not raw Tkinter; bundling 68 MB model + TF is off its path |
| Electron/Tauri wrapper | High | Over-engineering — would require rewriting the whole Tkinter UI as web |

### 7.3 Packaging steps (in order)

> ⚠️ The first four steps are **prerequisites** — without the path fix, the frozen app **crashes at
> import** before any window appears.

0. **Clean the tree** — bundle **only** the canonical `models/` trio (the root duplicates differ in size);
   exclude `untitled_project/`, `Modified_EDA.ipynb`, `tests/`, `docs/`, `UserManual.pdf`, `__pycache__/`.
   *(Do not modify the `models/` bytes.)*
1. **Add a `resource_path()` helper:**
   ```python
   import sys, os
   def resource_path(rel):
       base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
       return os.path.join(base, rel)
   ```
2. **Fix `predictor.py:6-10`** — load via `resource_path('models/...')`. *(Highest-risk fix: loads at
   import time; AI-safe — location only.)*
3. **Fix `audio_handler.py:76`** — Vosk path via `resource_path('models/vosk-model-small-en-us-0.15')`.
4. **Fix `ui_main.py:33,44`** — icon/mic assets via `resource_path('ui/assets/...')`.
5. **Separate writable data** — point `SESSIONS_DIR`/`SESSIONS_FILE` at
   `%LOCALAPPDATA%/SymptomsEaseAI/...` (Program Files is read-only for standard users), create on first
   run, migrate the relative paths stored in `sessions.json`.
6. **Add `ui/__init__.py` + `ui/styles/__init__.py`** (currently missing) so PyInstaller reliably collects
   `ui.styles.colors`.
7. **Write `symptomsease.spec`** — `datas=[('models','models'),('ui/assets','ui/assets')]`,
   `icon='ui/assets/app-icon.ico'`, `console=False`, `name='SymptomsEaseAI'`, hidden-imports for
   TF/sklearn, PyAudio/PortAudio collect.
8. **Shrink the payload** — build with **`tensorflow-cpu==2.9.1`** (inference only, no GPU needed); exclude
   `matplotlib`, `tkintertable` (never imported at runtime), `pytest`, TF test/examples submodules.
9. **Build `--onedir`** → `dist/SymptomsEaseAI/SymptomsEaseAI.exe` + bundled `models/` + `ui/assets/`.
10. **Smoke-test on a clean Windows PC with no Python** — create session → record → stop (Vosk) → Analyze
    (Keras) → confirm sessions persist under `%LOCALAPPDATA%`.
11. **Author the Inno Setup `.iss`** — install `dist/SymptomsEaseAI/` to `{autopf}/SymptomsEaseAI`, Start
    Menu + optional desktop shortcut, **never** write session data into `{app}`. **Sign** the `setup.exe`.
12. **macOS/Linux** — build PyInstaller natively per-OS; first **guard the Windows-only calls**
    (`ctypes.windll` `:35`, `iconbitmap` `:33`, `os.startfile` `:147`).

### 7.4 Website download flow

1. Download page with one primary **"Download for Windows"** button → `SymptomsEaseAI-Setup-vX.Y.Z.exe`,
   plus a **published SHA-256** and version/date, min-requirements (Windows 10/11 64-bit + a microphone).
2. Secondary, clearly-labeled macOS `.dmg` / Linux links.
3. Serve over **HTTPS**; if unsigned initially, add a "SmartScreen may warn → *More info → Run anyway*"
   note with a screenshot.
4. Installer wizard (license from the existing `LICENSE`, default Program Files, optional shortcut) → Finish
   with "Launch" checkbox.
5. First launch: app creates `%LOCALAPPDATA%/SymptomsEaseAI`, Windows prompts for mic on first record.
6. Keep a versioned releases area (or GitHub Releases) the page + updater both point at.

### 7.5 Signing, size, auto-update, first run

- **Signing:** Authenticode-sign **both** the exe and `setup.exe`. OV cert + a documented "Run anyway" note
  is pragmatic for a student project; EV grants instant SmartScreen reputation but costs more. macOS needs
  its own Developer-ID signing + notarization.
- **Size/AV:** TensorFlow dominates → `tensorflow-cpu`, `--onedir`, signed binaries, exclude unused packages;
  submit to AV false-positive portals if flagged. *(Future, AI-touching, out of scope: the model is tiny
  (~1.4 MB) so ONNX-runtime would drop TF entirely — but that changes how the model runs → off-limits.)*
- **Auto-update:** none today. Add a `__version__`; on launch, fetch a small JSON manifest (latest version +
  installer URL + SHA-256) **in a background thread, fail-silent if offline**; if newer, prompt to download
  & run the new signed installer (Inno upgrades in place when `AppId` matches). Optionally WinSparkle later.
  **Decide the offline-first tradeoff first** (§6).
- **First run:** friendly mic-permission hint + graceful handling of permission-denied; device enumeration
  instead of hardcoded index 0; create the per-user data dir before `restore_sessions()`; **ship no
  pre-existing sessions** (exclude the repo's stale `sessions.json`).

---

## 8. The Whole Refactor Plan (AI-Safe)

A phased plan. **Phases 0 and 1 are blocking** (everything depends on them). Within later phases, tracks
run in parallel. **A golden-output test gates every AI-adjacent change** (§4).

### Phase 0 — 🚨 Containment (do immediately, hours not days)
- Add `.gitignore`; **purge PHI from git history** (`git filter-repo`/BFG); force-push.
- Remove `data/sessions*`, `data/session_audio*`, `sessions.json`, `untitled_project/`, `__pycache__/`,
  `raw_data(in) (2).csv` from tracking; confirm public-clone exposure assumptions.
- **Exit criteria:** `git ls-files` shows zero PHI; history clean.

### Phase 1 — 🧱 Foundation: AI-safe portability (blocking, keystone)
- Add the `resource_path()` resolver; replace **every** `./...` path (`predictor.py`, `audio_handler.py`,
  `ui_main.py`).
- Defer the import-time model load behind a cached lazy loader (same algorithm).
- Relocate writable data to `%LOCALAPPDATA%/SymptomsEaseAI`; migrate `sessions.json` paths.
- Add `ui/__init__.py`, `ui/styles/__init__.py`; guard Windows-only calls.
- **Exit criteria:** app launches from any CWD; **golden-output identical**; runs headless-importable.

### Phase 2 — 🛡️ Safety & Compliance (parallel after P1)
- In-app **medical disclaimer** (startup modal + persistent banner + per-result line) + consent capture.
- **SHA-256 integrity verification** before loading model/scaler/features/Vosk; ship **one canonical
  `models/`** copy; delete root duplicates.
- **Licensing fix:** add NOTICE/attribution + Apache-2.0 text for the bundled Vosk model & TensorFlow.
- Path-sanitize `sessions.json` reads; cap transcription input size.
- **Exit criteria:** disclaimer unmissable; tampered artifact refuses to load; license audit clean.

### Phase 3 — ⚙️ Reliability & Concurrency (parallel after P1)
- Move STT + inference to a **worker thread** + `root.after()`; **load Vosk once** (cache).
- Fix audio lifecycle bugs: `get_sample_size()` before `terminate()`; `thread.join()` before stream close;
  empty/short-audio guard in `stop_recording`; **single** start/stop file index; re-entrancy guard.
- Add **VAD/no-speech** rejection, **device picker**, level meter, resample fallback.
- **Exit criteria:** UI never freezes; corrupt/empty recordings impossible; mic-failure has a recovery path.

### Phase 4 — 🎨 UX Polish (parallel after P3)
- Confidence bars + emphasized top result (display only); recording indicator + "Stop" toggle;
  `minsize`/responsive `PanedWindow`; centralized WCAG colors; keyboard shortcuts; delete confirmations;
  empty-state guidance; `see(tk.END)` autoscroll; remove dead button code.

### Phase 5 — 🧹 Code Hygiene, Docs, Tests (parallel after P1)
- Extract `SessionManager` service; delete dead/duplicate code; de-dup the transcription-enumeration helper.
- File **logging** replacing `print()`; `encoding='utf-8'` everywhere; type hints + static checker.
- **Rewrite `README.md`** to match reality; delete `RADME.md`; consolidate & pin dependencies.
- **Fix tests** (mock model, isolate PyAudio, real perf tests or delete) + **headless CI**.

### Phase 6 — 📦 Packaging & Distribution (after P1–P5)
- PyInstaller `--onedir` spec (`tensorflow-cpu`, excludes); Inno Setup `.iss`; code signing; version manifest
  + background fail-silent updater; website download page + SHA-256.
- **Exit criteria:** signed installer runs the full flow on a clean, Python-less Windows PC.

### Phase 7 — ✅ Verification (continuous + final gate)
- **Golden-output regression** on every AI-adjacent diff; full record→stop→analyze E2E on the frozen build;
  adversarial re-check that **no model byte changed** and predictions are identical.

### AI-touch ledger (the only places the refactor goes near the model — all load/integrity/caching)

| Phase | File | Change | Guarantee |
|---|---|---|---|
| 1 | `predictor.py:6-10` | path resolver + lazy cached load | algorithm + bytes unchanged |
| 1 | `audio_handler.py:76` | Vosk path resolver | model unchanged |
| 2 | `predictor.py:6-10` | SHA-256 verify before load | bytes verified, never altered |
| 2/6 | `models/` | delete root duplicates, ship canonical | `models/` bytes untouched |
| 3 | `audio_handler.py:74-84` | cache Vosk model | STT output unchanged |

---

## 9. The Refactor Workflow — New Agent Team & Orchestration

A multi-agent workflow to *execute* the plan above. **New agent names**, each owning a track, with an
always-on guard that vetoes any AI-boundary violation.

### 9.1 The agent roster

| Agent | Role | Owns | May touch AI? |
|---|---|---|:--:|
| 🛡️ **AEGIS** | **AI-Boundary Guard** (always-on) | Reviews *every* diff; blocks any change to `predictor.py` algorithm or `models/` bytes; runs the golden-output test | **Veto only** |
| 🚨 **SENTINEL** | Security containment | Phase 0: history purge, `.gitignore`, PHI removal | No |
| 🧭 **PATHFINDER** | Portability | Phase 1: `resource_path()`, fix all paths, lazy loader | Load-path only |
| 🔐 **VAULT** | Data & privacy | Phase 1–2: `%LOCALAPPDATA%` relocation, encryption, retention, consent | No |
| ⚖️ **WARRANT** | Compliance | Phase 2: disclaimer, licensing/attribution, path sanitization | No |
| 🔏 **INTEGRITY** | Artifact integrity | Phase 2: SHA-256 verify-before-load, single canonical copy | Load-path only |
| 🧵 **THREADSMITH** | Concurrency | Phase 3: worker thread, Vosk caching, race/lifecycle bugs | No |
| 🎙️ **ECHO** | Voice robustness | Phase 3: VAD, device picker, level meter, resample, no-speech UX | No (upstream of model) |
| 🎨 **PIXEL** | UI/UX | Phase 4: confidence bars, indicators, responsive layout, a11y | No |
| 🧹 **REFINER** | Code hygiene | Phase 5: god-class split, dead-code removal, logging, encoding, type hints | No |
| 📖 **SCRIBE** | Docs & deps | Phase 5: rewrite README, delete RADME, consolidate/pin deps | No |
| 🧪 **TESTWRIGHT** | Tests & CI | Phase 5: mock model, isolate PyAudio, headless CI | No |
| 📦 **PACKAGER** | Build & ship | Phase 6: PyInstaller spec, Inno Setup, signing, updater, download page | No |
| ✅ **WARDEN** | Final verification | Phase 7: E2E on frozen build, adversarial AI-byte audit | Verify only |

### 9.2 Orchestration (dependency-ordered, parallel where safe)

```
        ┌─────────────────────────────────────────────────────────┐
        │  AEGIS (AI-Boundary Guard) — reviews every diff, always  │
        └─────────────────────────────────────────────────────────┘
Phase 0  ▶ SENTINEL ───────────────────────── (BLOCKING: history clean)
                    │
Phase 1  ▶ PATHFINDER ── VAULT(relocate) ──── (BLOCKING: golden-output identical)
                    │
        ┌───────────┼───────────────┬───────────────┬──────────────┐
Phase 2 │  WARRANT  │   INTEGRITY   │               │              │   ← parallel
Phase 3 │THREADSMITH│     ECHO      │               │              │   ← parallel
Phase 5 │  REFINER  │    SCRIBE     │  TESTWRIGHT   │  VAULT(crypto)│   ← parallel
        └───────────┴───────┬───────┴───────────────┴──────────────┘
Phase 4              ▶ PIXEL (after THREADSMITH lands the worker thread)
                            │
Phase 6              ▶ PACKAGER (after P1–P5 merge)
                            │
Phase 7              ▶ WARDEN (final gate: clean-PC E2E + AI-byte audit)
```

### 9.3 Workflow pseudo-script (the shape, if you automate it)

```js
// Always-on guard wraps every code-writing agent.
const guard = (agent) => withAegis(agent); // vetoes AI-boundary edits, runs golden_output()

phase('Containment');
await guard(SENTINEL).run('purge git history, add .gitignore, remove PHI'); // BLOCKING

phase('Foundation');                                                        // BLOCKING
await parallel([
  () => guard(PATHFINDER).run('resource_path resolver + fix all ./ paths + lazy load'),
  () => guard(VAULT).run('relocate writable data to %LOCALAPPDATA%, migrate sessions.json'),
]);
assert(goldenOutputUnchanged());   // gate

phase('Safety + Reliability + Hygiene');                                    // parallel tracks
await parallel([
  () => guard(WARRANT).run('disclaimer + licensing/attribution + path sanitization'),
  () => guard(INTEGRITY).run('SHA-256 verify-before-load + single canonical models/'),
  () => guard(THREADSMITH).run('worker thread + cache Vosk + fix race/lifecycle bugs'),
  () => guard(ECHO).run('VAD + device picker + level meter + no-speech UX'),
  () => guard(REFINER).run('split god class, kill dead code, logging, utf-8, type hints'),
  () => guard(SCRIBE).run('rewrite README, delete RADME, consolidate+pin deps'),
  () => guard(TESTWRIGHT).run('mock model, isolate pyaudio, headless CI'),
]);

phase('UX Polish');
await guard(PIXEL).run('confidence bars, recording indicator, responsive layout, a11y');

phase('Package');
await guard(PACKAGER).run('PyInstaller --onedir + Inno Setup + signing + updater + download page');

phase('Verify');
await WARDEN.run('clean-PC E2E on frozen build + adversarial audit: no model byte changed');
```

> **Invariant enforced by AEGIS + WARDEN:** at no point do the bag-of-words vectorization,
> `scaler.transform`, `model.predict`, `argsort` top-2 logic, or any byte of `models/*` /
> `Modified_EDA.ipynb` change. If the golden-output test ever differs, the offending diff is reverted.

---

## 10. Appendix: Full Findings Tables

**Counts:** 5 dimensions • 58 findings (45 primary + 13 verifier-surfaced) • 1 active breach •
2 Critical • 7 High • ~20 Medium • rest Low/Info. Verifiers confirmed the large majority outright;
a handful were downgraded to "partial" for over-stated framing or off-by-one citations (noted inline in §5).

### Verifier corrections worth remembering

| Finding | Correction |
|---|---|
| AUD-02 | Empty transcript **is** guarded in `analyze` (`ui_main.py:500`) → downgraded to *partial*; the no-speech **UX** gap is still real. |
| SEC-04 | The JSON-driven arbitrary **read** via `open()` (`ui_main.py:68-71`) is fully real; sanitize before any open. |
| CQ-06 | `print()` count is **21**, not 22 (12 in `audio_handler.py` + 9 in `ui_main.py`). |
| CQ-07 | Duplicate artifacts confirmed **drifted**: root `trained_model.h5`=968,896 B vs `models/`=1,409,144 B. |
| SEC-03 → Critical | Not just "at risk" — PHI is **already committed and pushed** (a real name in `Session_6`). |

### Quick reference — files & their primary concerns

| File | Lines | Primary concerns |
|---|:--:|---|
| `ui_main.py` | ~623 | God class, duplicate `create_sidebar`, hardcoded paths, no disclaimer, main-thread blocking, no encoding, dead code |
| `audio_handler.py` | ~122 | Vosk reload-per-call, device index 0, no VAD, use-after-`terminate()`, race, `print` logging |
| `predictor.py` | ~36 | ⛔ AI boundary; import-time load; hardcoded paths; untrusted pickle/HDF5 load *(load-path fixes only)* |
| `sessions.json` | — | Committed PHI index; untrusted `path` field |
| `requirements.txt` / `requirements_viz.txt` | — | Split/unpinned deps; phantom `tkintertable`; EOL TF 2.9.1 |
| `README.md` / `RADME.md` | — | Top of README is fictional; `RADME.md` is a conflicting duplicate |
| `tests/*` | — | Don't mock the model; perf tests time the mock; need a mic+display |
| `models/*`, `Modified_EDA.ipynb` | — | ⛔ AI boundary — never modify bytes |

---

*End of report. No source code was changed in producing this document. Implementation should follow
Phase 0 → 1 first, with AEGIS guarding the AI boundary at every step.*
