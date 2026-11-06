"""CascadeAI Property Lead Finder: Streamlit app.

Retrieval only. The app reads a prebuilt index; it never loads a model, never generates
text, never calls the network, and never reads case files. Run: streamlit run app.py
"""
from __future__ import annotations

from datetime import date

import streamlit as st

from search.config import DATA, ROOT, load_config
from search.embedder import CLIP_NAME
from search.input_check import BLOCK_MESSAGE, check_keywords
from search.matcher import Index, search
from search.normalize import COLORS
from search.scenarios import FORM_FIELDS, SCENARIOS

st.set_page_config(page_title="CascadeAI · Property Lead Finder", page_icon="🔎", layout="wide")
CFG = load_config()
REGIONS = ["Northside", "Eastside", "Downtown", "Southside"]
DETECTIVES = ["DET-0142", "DET-0217", "DET-0388"]

st.markdown("""<style>
.block-container{padding-top:1.4rem}
.cascade-banner{background:#3b1d0b;border:1px solid #f59e0b;color:#fde68a;padding:.6rem 1rem;border-radius:.5rem;font-weight:600;margin-bottom:.8rem}
.cascade-fallback{background:#450a0a;border:1px solid #ef4444;color:#fecaca;padding:.5rem 1rem;border-radius:.5rem;margin-bottom:.8rem}
.factors{font-family:ui-monospace,monospace;font-size:.85rem;background:rgba(59,130,246,.1);border-left:3px solid #3b82f6;padding:.4rem .6rem;border-radius:.25rem}
</style>""", unsafe_allow_html=True)


@st.cache_resource
def get_index() -> Index:
    return Index(DATA)


try:
    INDEX = get_index()
except FileNotFoundError:
    st.error("No index found. Run `python scripts/generate_data.py` then `python scripts/build_index.py`.")
    st.stop()
EMBEDDER = INDEX.meta["embedder"]

st.markdown('<div class="cascade-banner">PROTOTYPE. Synthetic data only. Retrieval only: no case data, no text generation, no learning. A listing match is a lead, not proof.</div>', unsafe_allow_html=True)
if EMBEDDER != CLIP_NAME:
    st.markdown('<div class="cascade-fallback">Fallback embedder in use: results are for UI demo only.</div>', unsafe_allow_html=True)

# ---------- form state ----------
CATALOG = INDEX.catalog
CATEGORIES = sorted({m["category"] for m in CATALOG})
DEFAULTS = {"f_category": "laptop", "f_brand": "Corvane", "f_model": "Vega 15", "f_color": "any",
            "f_region": "Northside", "f_window_days": 30, "f_keywords": ""}
for k, v in DEFAULTS.items():
    st.session_state.setdefault(k, v)


def load_scenario(key: str) -> None:
    for f in FORM_FIELDS:
        st.session_state[f"f_{f}"] = SCENARIOS[key][f]
    st.session_state["run_now"] = True


# ---------- sidebar ----------
with st.sidebar:
    st.markdown("### 🔎 CascadeAI\n**Property Lead Finder**")
    page = st.radio("Page", ["Search"], label_visibility="collapsed")
    st.selectbox("Detective ID", DETECTIVES, key="detective", help="Stand-in for MFA and role-based access.")
    st.caption("Detective ID: stand-in for MFA and role-based access.")
    st.markdown("#### Demo scenarios")
    for key, s in SCENARIOS.items():
        st.button(s["label"], key=f"btn_{key}", on_click=load_scenario, args=(key,), width="stretch")
    st.divider()
    st.caption(f"Config version **{CFG['version']}** · threshold {CFG['threshold']:.3f} (frozen)")
    st.caption(f"Embedder: **{'CLIP (' + EMBEDDER + ')' if EMBEDDER == CLIP_NAME else EMBEDDER}**")
    st.caption(f"Demo date: {CFG['demo_today']}")


# ---------- search page ----------
def search_page() -> None:
    st.title("Property Lead Finder")
    st.caption("Describe the stolen item with structured fields. CascadeAI searches synthetic resale listings and returns possible matches with their sources.")

    c1, c2, c3 = st.columns(3)
    c1.selectbox("Category", CATEGORIES, key="f_category")
    brands = sorted({m["brand"] for m in CATALOG if m["category"] == st.session_state.f_category})
    if st.session_state.f_brand not in brands:
        st.session_state.f_brand = brands[0]
    c2.selectbox("Brand", brands, key="f_brand")
    models = [m["model"] for m in CATALOG if m["brand"] == st.session_state.f_brand and m["category"] == st.session_state.f_category]
    if st.session_state.f_model not in models:
        st.session_state.f_model = models[0]
    c3.selectbox("Model", models, key="f_model")
    c4, c5, c6 = st.columns(3)
    c4.selectbox("Color", ["any"] + COLORS, key="f_color")
    c5.selectbox("Region", REGIONS, key="f_region")
    c6.slider("Date window (days)", 1, CFG["max_window_days"], key="f_window_days")
    st.text_input(f"Keywords (optional, item details only, max {CFG['max_keywords_chars']} characters)",
                  key="f_keywords", max_chars=CFG["max_keywords_chars"],
                  placeholder="e.g. sticker on lid, engraved initials")
    clicked = st.button("Search listings", type="primary")

    if clicked or st.session_state.pop("run_now", False):
        q = {f: st.session_state[f"f_{f}"] for f in FORM_FIELDS}
        check = check_keywords(q["keywords"], CFG["max_keywords_chars"])  # runs BEFORE any search
        if not check.ok:
            st.session_state.result = ("blocked", check.reasons)
            on_blocked()
        else:
            res = search(q, INDEX, CFG)
            st.session_state.result = ("ok", res)
            on_searched(q, res)

    if "result" in st.session_state:
        kind, payload = st.session_state.result
        if kind == "blocked":
            st.error(f"**Search blocked.** {BLOCK_MESSAGE}")
            st.caption("Detected: " + ", ".join(payload) + ". No search was run and the text was not saved.")
        else:
            render_package(payload)


def on_blocked() -> None:
    pass


def on_searched(q: dict, res) -> None:
    pass


def coverage_box(res) -> None:
    m = INDEX.meta
    with st.container(border=True):
        st.markdown("**Search coverage**")
        st.markdown(
            f"Sources searched: {', '.join(m['sources'])} (synthetic) · index snapshot captured {m['built_at']}  \n"
            f"Region: {res.query['region']} · posted {res.window_start} to {res.window_end} · "
            f"{res.n_in_window} listings in window · {m['n_indexed']} indexed in total "
            f"({m['n_duplicates_collapsed']} duplicate reposts collapsed)")


def render_package(res) -> None:
    q = res.query
    st.divider()
    st.subheader("Property Lead Package")
    a, b, c = st.columns([1, 2, 3])
    a.metric("Leads", len(res.leads) if res.outcome == "ranked" else (f"{len(res.leads)} (unranked)" if res.outcome == "too_many" else 0))
    b.markdown(f"**Outcome**  \n{res.message}")
    c.markdown(f"**Query**  \n{q['brand']} {q['model']} ({q['category']}) · color {q['color']} · {q['region']} · last {q['window_days']} days"
               + (f" · keywords “{q['keywords']}”" if q["keywords"] else ""))
    coverage_box(res)

    if res.outcome == "none":
        st.info(f"**No match found.** No listing in {q['region']} from {res.window_start} to {res.window_end} scored above the frozen threshold ({CFG['threshold']:.3f}). Weaker guesses are not shown.")
        return
    if res.outcome == "too_many":
        st.warning(f"**Too many similar listings to rank reliably.** {len(res.leads)} listings scored above the threshold, more than the {CFG['max_ranked']} the tool will rank.")
        st.caption("Suggestion: narrow the date window, pick a specific color, or add a distinctive keyword (a sticker, engraving or accessory). Listed below unranked, newest first.")
        st.dataframe(
            [{"Posted": l.date_posted, "Title": l.title, "Price": f"${l.price:,}", "Source": l.source, "Region": l.region, "Link": l.url} for l in res.leads],
            column_config={"Link": st.column_config.LinkColumn("Link")}, hide_index=True, width="stretch")
        return
    for rank, l in enumerate(res.leads, 1):
        with st.container(border=True):
            p1, p2, info = st.columns([1, 1, 2.2])
            p1.image(str(ROOT / l.captured_path), caption="Saved listing photo", width="stretch")
            p2.image(str(ROOT / l.reference_path), caption=f"Official reference: {q['brand']} {q['model']}", width="stretch")
            with info:
                st.markdown(f"#### #{rank} · {l.title}")
                st.markdown(f"**${l.price:,}** · posted {date.fromisoformat(l.date_posted):%b %d, %Y} · {l.source} · {l.region}")
                st.markdown(f"[{l.url}]({l.url})  \nListing ID {l.id} · captured {l.captured_at}")
                st.markdown(f'<div class="factors">{l.factors}</div>', unsafe_allow_html=True)
                st.caption(f"Combined score {l.final_score:.3f} = {CFG['w_text']} × text {l.text_score:.3f} + {CFG['w_img']} × image {l.image_score:.3f}")
                if l.also_posted:
                    st.caption("Also posted (duplicate collapsed): " + "; ".join(f"{d['source']} on {d['date_posted']} ({d['id']})" for d in l.also_posted))
    st.caption("A listing match is a lead, not proof. The detective checks each listing and decides what to do next.")


if page == "Search":
    search_page()
