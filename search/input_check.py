"""Blocks personal or case details before any search runs. Rules only, no model."""
from __future__ import annotations

import re
from dataclasses import dataclass, field

BLOCK_MESSAGE = "Personal or case details are not allowed here. Use item details only."

STREET_TYPES = r"(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|ct|court|pl|place|ter|terrace|hwy|highway|pkwy)"

PATTERNS: dict[str, re.Pattern] = {
    "email": re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+"),
    "phone": re.compile(r"(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b"),
    "street address": re.compile(rf"\b\d{{1,6}}\s+(?:[a-z0-9.]+\s+){{0,4}}{STREET_TYPES}\b\.?", re.I),
    "case number": re.compile(
        r"\bcase\s*(?:#|no\.?|num(?:ber)?)?\s*:?\s*[a-z]*-?\d+"   # "case #4417", "case no. 24-118"
        r"|\b[a-z]{0,4}-?\d{2,4}-\d{3,}(?:-\d+)?\b"                # "CC-2026-004417", "24-118832"
        r"|#\s*\d{4,}",                                            # "#004417"
        re.I,
    ),
    "serial-like string": re.compile(r"\b(?=[a-z0-9]*\d)(?=[a-z0-9]*[a-z])[a-z0-9]{8,}\b", re.I),
}


@dataclass(frozen=True)
class CheckResult:
    ok: bool
    reasons: tuple[str, ...] = field(default_factory=tuple)
    message: str = ""


def check_keywords(text: str | None, max_chars: int) -> CheckResult:
    text = (text or "").strip()
    reasons = []
    if len(text) > max_chars:
        reasons.append(f"over {max_chars} characters")
    reasons += [name for name, rx in PATTERNS.items() if rx.search(text)]
    if reasons:
        return CheckResult(False, tuple(reasons), BLOCK_MESSAGE)
    return CheckResult(True)
