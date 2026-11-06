#!/usr/bin/env bash
# Creates a virtual environment, installs dependencies (CPU PyTorch), and caches the
# CLIP weights once so the app works fully offline afterwards.
# Works on macOS/Linux and on Windows in Git Bash.
set -euo pipefail
cd "$(dirname "$0")"

if command -v python3.11 >/dev/null 2>&1; then PY="python3.11"
elif command -v py >/dev/null 2>&1 && py -3.11 --version >/dev/null 2>&1; then PY="py -3.11"
else PY="python3"; fi
echo "Using $($PY --version)"

$PY -m venv .venv
if [ -f .venv/bin/python ]; then VPY=.venv/bin/python; ACT="source .venv/bin/activate"
else VPY=.venv/Scripts/python; ACT="source .venv/Scripts/activate"; fi

$VPY -m pip install --upgrade pip
$VPY -m pip install torch --index-url https://download.pytorch.org/whl/cpu
$VPY -m pip install -r requirements.txt

echo "Caching CLIP weights (one-time download; everything after this works offline) ..."
$VPY -c "from search.embedder import get_embedder; print('Embedder ready:', get_embedder(allow_download=True).name)"

cat <<MSG

Setup complete. Next:

  $ACT
  python scripts/generate_data.py     # synthetic catalog, images, listings (seeded)
  python scripts/build_index.py       # normalize, dedupe, embed, store
  streamlit run app.py                # open http://localhost:8501

Optional:
  pytest                              # test suite
  python scripts/evaluate.py          # synthetic benchmark
MSG
