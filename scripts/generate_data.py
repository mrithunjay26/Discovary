"""Generates the synthetic catalog, images and resale listings (fixed seed, fully offline).

Outputs in data/:
  catalog.yaml         fictional product models with aliases and official reference photos
  images/reference/    clean "official" product photos (2-3 angles per model)
  images/listings/     messy listing photos (rotated, cropped, blurred, new background)
  listings.csv         ~400 listings across 3 fictional sources and 4 regions
  ground_truth.csv     which model each listing really shows (used by tests/evaluate only)
  scenarios.json       planted listing ids for demo scenarios S1-S3

Nothing is downloaded. If you put freely licensed photos in data/raw_images/<category>/,
they are used as the item picture instead of the drawn placeholder.
"""
from __future__ import annotations

import csv
import json
import random
import shutil
import sys
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import yaml
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from search.config import DATA, load_config  # noqa: E402

CANVAS = 320
SOURCES = ["MarketA", "MarketB", "ResaleC"]
REGIONS = ["Northside", "Eastside", "Downtown", "Southside"]

# Fictional brands and models only.
MODELS = [
    dict(key="corvane-vega-15", category="laptop", brand="Corvane", model="Vega 15", color="black", rgb=(30, 30, 36), size=1.0, price=1400, aliases=["vega15", "vega 15 laptop", "corvane v15"]),
    dict(key="corvane-vega-13", category="laptop", brand="Corvane", model="Vega 13", color="black", rgb=(42, 42, 48), size=0.86, price=1100, aliases=["vega13", "vega 13 laptop", "corvane v13"]),
    dict(key="lumetra-slate-pro", category="laptop", brand="Lumetra", model="Slate Pro", color="silver", rgb=(188, 193, 200), size=1.0, price=1700, aliases=["slatepro", "slate pro laptop"]),
    dict(key="pebblo-tab-10", category="tablet", brand="Pebblo", model="Tab 10", color="white", rgb=(246, 246, 242), size=1.0, price=380, aliases=["tab10", "pebblo tab10", "ptab 10"]),
    dict(key="pebblo-tab-mini", category="tablet", brand="Pebblo", model="Tab Mini", color="blue", rgb=(70, 110, 190), size=0.85, price=290, aliases=["tabmini", "pebblo mini"]),
    dict(key="optiva-snapline-x", category="camera", brand="Optiva", model="Snapline X", color="silver", rgb=(178, 182, 188), size=1.0, price=1150, aliases=["snaplinex", "snapline x camera"]),
    dict(key="kestrel-k7-pro", category="camera", brand="Kestrel", model="K7 Pro", color="black", rgb=(32, 32, 32), size=0.95, price=900, aliases=["k7pro", "kestrel k7"]),
    dict(key="novaplay-orbit", category="game console", brand="Novaplay", model="Orbit", color="gray", rgb=(122, 126, 134), size=1.0, price=450, aliases=["nova orbit", "orbit console"]),
    dict(key="torqmax-dr-20", category="power tool", brand="Torqmax", model="DR 20", color="yellow", rgb=(232, 182, 30), size=1.0, price=160, aliases=["dr20", "dr-20", "torqmax drill"]),
    dict(key="ridgeline-trail-29", category="bicycle", brand="Ridgeline", model="Trail 29", color="green", rgb=(40, 140, 80), size=1.0, price=1200, aliases=["trail29", "ridgeline 29er"]),
    dict(key="aurelle-halo-pendant", category="pendant necklace", brand="Aurelle", model="Halo Pendant", color="gold", rgb=(212, 175, 55), size=1.0, price=650, aliases=["halo necklace", "aurelle halo"]),
    dict(key="sonique-arc-anc", category="headphones", brand="Sonique", model="Arc ANC", color="red", rgb=(190, 45, 45), size=1.0, price=320, aliases=["arcanc", "arc anc headphones", "sonique arc"]),
]
BY_KEY = {m["key"]: m for m in MODELS}
COLOR_ABBR = {"black": "blk", "silver": "slvr", "white": "wht", "blue": "blu", "gray": "gry", "yellow": "ylw", "green": "grn", "gold": "gld", "red": "red"}


def font(size: int):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow < 10.1
        return ImageFont.load_default()


# ---------- drawing ----------
def draw_item(m: dict, raw: dict[str, list[Path]]) -> Image.Image:
    """Item on a transparent layer: a category silhouette, the model's color, and its name."""
    layer = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    if raw.get(m["category"]):
        photo = Image.open(raw[m["category"]][0]).convert("RGBA")
        photo.thumbnail((260, 260))
        layer.paste(photo, ((CANVAS - photo.width) // 2, (CANVAS - photo.height) // 2))
    else:
        d = ImageDraw.Draw(layer)
        c, o, w = m["rgb"] + (255,), (20, 20, 24, 255), 4
        cat = m["category"]
        if cat == "laptop":
            d.rectangle((70, 60, 250, 180), fill=c, outline=o, width=w)
            d.rectangle((82, 72, 238, 168), fill=(50, 80, 130, 255))
            d.polygon([(50, 190), (270, 190), (292, 232), (28, 232)], fill=c, outline=o)
            d.rectangle((130, 205, 190, 220), outline=o, width=2)
        elif cat == "tablet":
            d.rounded_rectangle((100, 36, 220, 284), 18, fill=c, outline=o, width=w)
            d.rectangle((112, 52, 208, 258), fill=(50, 80, 130, 255))
            d.ellipse((152, 264, 168, 280), outline=o, width=2)
        elif cat == "camera":
            d.rounded_rectangle((100, 84, 165, 112), 6, fill=c, outline=o, width=w)
            d.rounded_rectangle((55, 108, 265, 232), 14, fill=c, outline=o, width=w)
            d.ellipse((112, 122, 208, 218), fill=(35, 35, 40, 255), outline=o, width=w)
            d.ellipse((134, 144, 186, 196), fill=(90, 120, 160, 255))
        elif cat == "game console":
            d.rounded_rectangle((45, 140, 275, 200), 10, fill=c, outline=o, width=w)
            d.line((60, 170, 260, 170), fill=o, width=2)
            for x in (60, 180):
                d.ellipse((x, 215, x + 80, 262), fill=c, outline=o, width=w)
        elif cat == "power tool":
            d.rounded_rectangle((55, 96, 232, 152), 12, fill=c, outline=o, width=w)
            d.rectangle((232, 116, 292, 132), fill=(150, 150, 155, 255), outline=o)
            d.polygon([(118, 152), (172, 152), (162, 248), (108, 248)], fill=c, outline=o)
            d.rounded_rectangle((90, 246, 190, 286), 6, fill=(40, 40, 44, 255), outline=o)
        elif cat == "bicycle":
            for cx in (88, 232):
                d.ellipse((cx - 56, 154, cx + 56, 266), outline=c, width=9)
            for a, b in [((88, 210), (150, 140)), ((150, 140), (210, 140)), ((210, 140), (232, 210)), ((88, 210), (165, 210)), ((165, 210), (150, 140)), ((165, 210), (210, 140))]:
                d.line((a, b), fill=c, width=9)
            d.line((140, 128, 166, 128), fill=o, width=8)
        elif cat == "pendant necklace":
            d.arc((70, 10, 250, 200), 15, 165, fill=c, width=7)
            d.line((160, 196, 160, 214), fill=c, width=5)
            d.ellipse((126, 212, 194, 280), fill=c, outline=o, width=w)
            d.ellipse((148, 234, 172, 258), fill=(0, 0, 0, 0), outline=o, width=3)
        elif cat == "headphones":
            d.arc((70, 40, 250, 230), 180, 360, fill=c, width=20)
            d.arc((70, 40, 250, 230), 180, 360, fill=o, width=3)
            for x in (52, 214):
                d.rounded_rectangle((x, 130, x + 54, 226), 16, fill=c, outline=o, width=w)
    # model name label so the image model can tell siblings apart
    d = ImageDraw.Draw(layer)
    f = font(26)
    label = m["model"].upper()
    tw = d.textlength(label, font=f)
    y = 292 if m["category"] != "bicycle" else 20
    d.rounded_rectangle(((CANVAS - tw) / 2 - 10, y - 4, (CANVAS + tw) / 2 + 10, y + 26), 6, fill=(15, 15, 20, 235))
    d.text(((CANVAS - tw) / 2, y - 2), label, font=f, fill=(255, 255, 255, 255))
    if m["size"] != 1.0:
        s = int(CANVAS * m["size"])
        small = layer.resize((s, s), Image.LANCZOS)
        layer = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        layer.paste(small, ((CANVAS - s) // 2, (CANVAS - s) // 2))
    return layer


def angle(layer: Image.Image, v: int) -> Image.Image:
    """Three 'official photo' angles: front, tilted, and turned (horizontally squeezed)."""
    if v == 1:
        return layer.rotate(12, resample=Image.BICUBIC)
    if v == 2:
        squeezed = layer.resize((int(CANVAS * 0.8), CANVAS), Image.LANCZOS).rotate(-6, resample=Image.BICUBIC, expand=False)
        out = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        out.paste(squeezed, ((CANVAS - squeezed.width) // 2, 0), squeezed)
        return out
    return layer


def stamp(img: Image.Image) -> Image.Image:
    d = ImageDraw.Draw(img)
    d.text((8, 6), "SYNTHETIC", font=font(12), fill=(120, 120, 120))
    return img


BACKGROUNDS = [(150, 110, 70), (95, 95, 100), (60, 75, 120), (205, 190, 160), (40, 38, 36), (180, 160, 150), (120, 140, 110), (225, 225, 230)]


def messy_photo(layer: Image.Image, rng: random.Random, nprng: np.random.Generator) -> Image.Image:
    """A listing photo: new background with texture, random angle, rotation, crop, light, blur."""
    item = angle(layer, rng.randrange(3))
    scale = rng.uniform(0.72, 1.0)
    s = int(CANVAS * scale)
    item = item.resize((s, s), Image.LANCZOS).rotate(rng.uniform(-15, 15), resample=Image.BICUBIC)
    base = np.array(rng.choice(BACKGROUNDS), dtype=np.float32)
    tex = nprng.normal(0, rng.uniform(4, 14), (CANVAS, CANVAS, 1)) + np.linspace(-18, 18, CANVAS)[None, :, None]
    bg = Image.fromarray(np.clip(base + tex, 0, 255).astype(np.uint8), "RGB")
    off = CANVAS - s
    bg.paste(item, (rng.randint(0, off), rng.randint(0, off)), item)
    c = rng.uniform(0.85, 0.96)
    cw = int(CANVAS * c)
    x0, y0 = rng.randint(0, CANVAS - cw), rng.randint(0, CANVAS - cw)
    img = bg.crop((x0, y0, x0 + cw, y0 + cw)).resize((256, 256), Image.LANCZOS)
    img = ImageEnhance.Brightness(img).enhance(rng.uniform(0.7, 1.25))
    img = img.filter(ImageFilter.GaussianBlur(rng.uniform(0, 1.4)))
    return stamp(img)


# ---------- text ----------
CONDITIONS = ["like new", "barely used", "works grt", "minor scuffs", "gud cond", "no box", "works perfect", "lightly used"]
EXTRAS = ["comes w/ charger", "pick up only", "cash only", "obo", "price firm", "moving sale", "need gone asap", "no trades", "first come first serve"]


def typo(word: str, rng: random.Random) -> str:
    if len(word) > 4 and rng.random() < 0.18:
        i = rng.randrange(1, len(word) - 2)
        return word[:i] + word[i + 1] + word[i] + word[i + 2:]
    return word


def listing_text(m: dict, rng: random.Random) -> tuple[str, str]:
    color = rng.choice([m["color"], COLOR_ABBR[m["color"]]]) if rng.random() < 0.8 else ""
    brand = m["brand"] if rng.random() < 0.8 else m["brand"][:-1]  # a dropped letter, e.g. "Corvan"
    alias = rng.choice(m["aliases"])
    name = rng.choice([f"{brand} {m['model']}", alias, alias if m["brand"].lower() in alias else f"{brand} {alias}"])
    cat = m["category"] if rng.random() < 0.7 else ""
    title = rng.choice([
        f"{name} {cat} {color}", f"{name} - {rng.choice(CONDITIONS)}", f"{color} {name} {cat} obo", f"{name} {color}",
    ])
    desc_words = f"{rng.choice(CONDITIONS)}. {rng.choice(EXTRAS)}. {rng.choice(EXTRAS)}".split()
    desc = " ".join(typo(w, rng) for w in desc_words)
    return " ".join(title.split()), desc


# ---------- main ----------
def main() -> None:
    cfg = load_config()
    today = date.fromisoformat(cfg["demo_today"])
    rng = random.Random(cfg["seed"])
    nprng = np.random.default_rng(cfg["seed"])

    for sub in ("images", "captured"):
        shutil.rmtree(DATA / sub, ignore_errors=True)
    (DATA / "images" / "reference").mkdir(parents=True)
    (DATA / "images" / "listings").mkdir(parents=True)

    raw = {}
    raw_dir = DATA / "raw_images"
    for cat_dir in raw_dir.glob("*"):
        if cat_dir.is_dir():
            raw[cat_dir.name] = sorted(p for p in cat_dir.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png"})
    if not any(raw.values()):
        print("NOTICE: no photos in data/raw_images/, so all images are SYNTHETIC drawn placeholders.")

    layers = {m["key"]: draw_item(m, raw) for m in MODELS}

    catalog = []
    for m in MODELS:
        refs = []
        for v in range(3):
            img = Image.new("RGB", (CANVAS, CANVAS), (238, 238, 238))
            img.paste(angle(layers[m["key"]], v), (0, 0), angle(layers[m["key"]], v))
            p = DATA / "images" / "reference" / f"{m['key']}_{v}.png"
            stamp(img).save(p)
            refs.append(p.relative_to(ROOT).as_posix())
        catalog.append({k: m[k] for k in ("key", "category", "brand", "model", "color", "aliases")} | {"reference_images": refs})
    with open(DATA / "catalog.yaml", "w", encoding="utf-8") as f:
        yaml.safe_dump({"note": "Fictional brands and models. Synthetic data only.", "models": catalog}, f, sort_keys=False)

    listings: list[dict] = []
    truth: list[dict] = []
    photos: dict[str, Image.Image] = {}

    def add(key: str, region: str, age: int, source: str | None = None, copy_of: dict | None = None) -> dict:
        m = BY_KEY[key]
        lid = f"L-{len(listings) + 1:04d}"
        source = source or rng.choice(SOURCES)
        if copy_of:  # repost of the same item on another source: same photo and text, a few days later
            title, desc, price = copy_of["title"], copy_of["description"], copy_of["price"]
            img = photos[copy_of["id"]]
        else:
            title, desc = listing_text(m, rng)
            price = int(round(m["price"] * rng.uniform(0.4, 0.85), -1))
            img = messy_photo(layers[key], rng, nprng)
        path = DATA / "images" / "listings" / f"{lid}.jpg"
        img.save(path, quality=rng.randint(72, 88))
        photos[lid] = img
        row = dict(id=lid, title=title, description=desc, price=price,
                   date_posted=(today - timedelta(days=age)).isoformat(), region=region, source=source,
                   url=f"https://{source.lower()}.example/item/{lid}", photo_path=path.relative_to(ROOT).as_posix())
        listings.append(row)
        truth.append(dict(id=lid, model_key=key, repost_of=copy_of["id"] if copy_of else ""))
        return row

    # Planted scenarios (deterministic)
    s1_true = [add("corvane-vega-15", "Northside", a, s) for a, s in [(3, "MarketA"), (9, "ResaleC"), (17, "MarketB")]]
    s1_repost = add("corvane-vega-15", "Northside", 7, "MarketA", copy_of=s1_true[1])
    s1_decoys = [add("corvane-vega-13", "Northside", a) for a in (5, 12, 20, 26)]
    s2 = [add("pebblo-tab-10", "Eastside", 1 + i % 29) for i in range(44)]
    s3_elsewhere = [add("optiva-snapline-x", r, a) for r, a in [("Southside", 6), ("Southside", 14), ("Downtown", 50), ("Downtown", 75)]]

    # Background listings. Protected combos keep the planted scenarios exact.
    def protected(key: str, region: str, age: int) -> bool:
        return ((key in ("corvane-vega-15", "corvane-vega-13") and region == "Northside" and age <= 35)
                or (key == "optiva-snapline-x" and region == "Downtown" and age <= 35))

    weights = [1.0 if m["key"] != "pebblo-tab-10" else 2.0 for m in MODELS]
    background = []
    while len(background) < 325:
        m = rng.choices(MODELS, weights)[0]
        region, age = rng.choice(REGIONS), rng.randint(0, 120)
        if not protected(m["key"], region, age):
            background.append(add(m["key"], region, age))

    # Deliberate duplicates: the same item reposted on a different source a few days later.
    key_of = {t["id"]: t["model_key"] for t in truth}
    for orig in rng.sample(background, 12):
        key = key_of[orig["id"]]
        new_age = max(0, (today - date.fromisoformat(orig["date_posted"])).days - rng.randint(1, 6))
        if not protected(key, orig["region"], new_age):
            add(key, orig["region"], new_age, rng.choice([s for s in SOURCES if s != orig["source"]]), copy_of=orig)

    with open(DATA / "listings.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(listings[0]))
        w.writeheader()
        w.writerows(listings)
    with open(DATA / "ground_truth.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["id", "model_key", "repost_of"])
        w.writeheader()
        w.writerows(truth)
    scenarios = {
        "S1": {"true_matches": [r["id"] for r in s1_true], "repost_of_true_match": s1_repost["id"], "decoys": [r["id"] for r in s1_decoys]},
        "S2": {"planted": [r["id"] for r in s2]},
        "S3": {"outside_region_or_window": [r["id"] for r in s3_elsewhere]},
    }
    (DATA / "scenarios.json").write_text(json.dumps(scenarios, indent=2), encoding="utf-8")
    n_dups = sum(1 for t in truth if t["repost_of"])
    print(f"Generated {len(MODELS)} catalog models, {len(listings)} listings ({n_dups} deliberate reposts) in {DATA}.")


if __name__ == "__main__":
    main()
