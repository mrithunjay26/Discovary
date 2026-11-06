"""Image embedding behind one small interface: embed_images(paths) -> np.ndarray.

The only model is the pretrained `clip-ViT-B-32` from sentence-transformers, used as
released (no training, no fine-tuning). Embeddings are computed once at index-build
time; the app never loads the model and never touches the network at query time.

If CLIP cannot load (for example no internet before the weights are cached), a
color-histogram embedder is used instead and the UI shows a fallback banner.
"""
from __future__ import annotations

import os
from typing import Sequence

import numpy as np
from PIL import Image

CLIP_NAME = "clip-ViT-B-32"
HISTOGRAM_NAME = "color-histogram (fallback)"


def _l2(x: np.ndarray) -> np.ndarray:
    x = x.astype(np.float32)
    return x / np.clip(np.linalg.norm(x, axis=1, keepdims=True), 1e-12, None)


class HistogramEmbedder:
    name = HISTOGRAM_NAME

    def embed_images(self, paths: Sequence[str]) -> np.ndarray:
        out = []
        for p in paths:
            img = Image.open(p).convert("RGB").resize((128, 128))
            a = np.asarray(img) // 32  # 8 bins per channel
            idx = a[..., 0] * 64 + a[..., 1] * 8 + a[..., 2]
            out.append(np.bincount(idx.ravel(), minlength=512))
        return _l2(np.array(out))


class ClipEmbedder:
    name = CLIP_NAME

    def __init__(self, allow_download: bool = False):
        from sentence_transformers import SentenceTransformer

        if not allow_download:
            os.environ.setdefault("HF_HUB_OFFLINE", "1")
        self.model = SentenceTransformer(CLIP_NAME, device="cpu")

    def embed_images(self, paths: Sequence[str]) -> np.ndarray:
        imgs = [Image.open(p).convert("RGB") for p in paths]
        vecs = self.model.encode(imgs, batch_size=32, convert_to_numpy=True, show_progress_bar=False)
        return _l2(vecs)


def get_embedder(allow_download: bool = False):
    """CLIP if it loads, otherwise the histogram fallback. Set TRACEBACK_EMBEDDER=histogram to force it."""
    if os.environ.get("TRACEBACK_EMBEDDER") == "histogram":
        return HistogramEmbedder()
    try:
        return ClipEmbedder(allow_download=allow_download)
    except Exception as e:  # missing weights, no torch, etc.
        print(f"[embedder] CLIP unavailable ({type(e).__name__}); using histogram fallback.")
        return HistogramEmbedder()


def embed_images(paths: Sequence[str]) -> np.ndarray:
    return get_embedder().embed_images(paths)
