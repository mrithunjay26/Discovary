"""Loads config.yaml once into a read-only mapping. Nothing at runtime can change it."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from types import MappingProxyType
from typing import Mapping

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
CONFIG_PATH = ROOT / "config.yaml"


@lru_cache(maxsize=1)
def load_config(path: str | None = None) -> Mapping:
    with open(path or CONFIG_PATH, encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    return MappingProxyType(cfg)
