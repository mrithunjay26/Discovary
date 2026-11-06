"""Static and behavioral checks for the hard rules."""
import ast
import json
from pathlib import Path

from search.audit import AuditLog
from search.matcher import search
from search.scenarios import query_of

ROOT = Path(__file__).resolve().parent.parent
LLM_LIBS = {"openai", "anthropic", "langchain", "langchain_core", "langchain_openai", "google.generativeai", "google.genai",
            "cohere", "mistralai", "ollama", "llama_cpp", "transformers", "vertexai", "litellm", "huggingface_hub"}
NET_LIBS = {"requests", "httpx", "urllib", "urllib3", "socket", "http", "aiohttp", "websockets"}


def imports(path: Path) -> set[str]:
    names = set()
    for node in ast.walk(ast.parse(path.read_text(encoding="utf-8"))):
        if isinstance(node, ast.Import):
            names |= {a.name for a in node.names}
        elif isinstance(node, ast.ImportFrom) and node.module and node.level == 0:
            names.add(node.module)
    return names


def project_files():
    return [ROOT / "app.py", *(ROOT / "search").glob("*.py"), *(ROOT / "scripts").glob("*.py")]


def test_no_llm_or_ai_client_imports():
    for f in project_files():
        for name in imports(f):
            assert not any(name == lib or name.startswith(lib + ".") for lib in LLM_LIBS), f"{f.name} imports {name}"


def test_no_network_libraries_in_search():
    for f in (ROOT / "search").glob("*.py"):
        for name in imports(f):
            assert name.split(".")[0] not in NET_LIBS, f"{f.name} imports {name}"


def test_app_never_loads_a_model():
    names = imports(ROOT / "app.py")
    assert "sentence_transformers" not in names and "torch" not in names
    assert "get_embedder" not in (ROOT / "app.py").read_text(encoding="utf-8")


def test_no_feedback_or_rating_ui():
    src = (ROOT / "app.py").read_text(encoding="utf-8").lower()
    for banned in ("st.feedback", "thumbs", "rating", "was this useful", "star_rating", "upvote", "downvote"):
        assert banned not in src, banned


def test_no_free_text_narrative_field():
    src = (ROOT / "app.py").read_text(encoding="utf-8")
    assert "st.text_area" not in src
    assert src.count("st.text_input(") == 1  # the 60-character keywords field only


def test_config_is_read_only_and_unchanged(cfg, index):
    before = dict(cfg)
    for key in ("S1", "S2", "S3"):
        search(query_of(key), index, cfg)
    assert dict(cfg) == before
    try:
        cfg["threshold"] = 0  # type: ignore[index]
        raise AssertionError("config should be read-only")
    except TypeError:
        pass


def test_blocked_input_not_logged(tmp_path, cfg, index):
    log = AuditLog(tmp_path / "audit.db")
    secret = "1420 Maple Ave 206-555-0147"
    log.log_blocked("DET-0142")
    log.log_search("DET-0142", query_of("S1"), cfg["version"], index.meta["embedder"], search(query_of("S1"), index, cfg))
    rows = log.rows()
    assert rows[0]["outcome"] == "ranked" and rows[1]["outcome"] == "blocked"
    assert rows[1]["query_json"] is None and rows[1]["listing_ids"] is None
    assert secret not in json.dumps(rows)
    assert secret not in (tmp_path / "audit.db").read_bytes().decode("latin-1")
