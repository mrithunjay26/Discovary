import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from search.config import DATA, load_config  # noqa: E402


@pytest.fixture(scope="session")
def cfg():
    return load_config()


@pytest.fixture(scope="session")
def index():
    """Uses the existing index; builds it from scratch if missing."""
    if not (DATA / "index.parquet").exists():
        subprocess.run([sys.executable, str(ROOT / "scripts" / "generate_data.py")], check=True)
        subprocess.run([sys.executable, str(ROOT / "scripts" / "build_index.py")], check=True)
    from search.matcher import Index
    return Index(DATA)


@pytest.fixture(scope="session")
def planted():
    return json.loads((DATA / "scenarios.json").read_text(encoding="utf-8"))
