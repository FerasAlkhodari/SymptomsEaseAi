# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for SymptomsEase AI (desktop, --onedir).

Bundles the Keras model, the Vosk model, the scaler/features pickles and the
UI assets. The AI files are shipped UNCHANGED; ui_main._apply_frozen_cwd()
chdir's into the bundle at startup so the app's relative paths resolve.
"""
from PyInstaller.utils.hooks import collect_all

# --- our application data: AI model + vosk model + ui assets/styles ---
datas = [('models', 'models'), ('ui', 'ui')]
binaries = []
hiddenimports = []

# --- pull in everything the heavy ML/audio packages need ---
for pkg in ['tensorflow', 'keras', 'vosk', 'sklearn', 'scipy', 'ml_dtypes',
            'h5py', 'optree', 'google']:
    try:
        d, b, h = collect_all(pkg)
        datas += d
        binaries += b
        hiddenimports += h
    except Exception as exc:  # noqa: BLE001
        print('collect_all skipped for', pkg, '->', exc)

a = Analysis(
    ['ui_main.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['matplotlib', 'pandas', 'seaborn', 'pytest', 'tkintertable',
              'notebook', 'IPython', 'jupyter'],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='SymptomsEaseAI',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,           # windowed release build (no console window)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='ui/assets/app-icon.ico',
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='SymptomsEaseAI',
)
