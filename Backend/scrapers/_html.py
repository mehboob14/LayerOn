"""Minimal HTML → plain-text helpers (no BeautifulSoup dependency)."""
from __future__ import annotations

import html
import re

_TAG_RE = re.compile(r"<[^>]+>")
_SCRIPT_RE = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.DOTALL | re.IGNORECASE)
_WHITESPACE_RE = re.compile(r"[ \t]+")
_BLANKLINES_RE = re.compile(r"\n{3,}")


def html_to_text(raw: str) -> str:
    if not raw:
        return ""
    cleaned = _SCRIPT_RE.sub(" ", raw)
    cleaned = _TAG_RE.sub(" ", cleaned)
    cleaned = html.unescape(cleaned)
    cleaned = _WHITESPACE_RE.sub(" ", cleaned)
    cleaned = "\n".join(line.strip() for line in cleaned.splitlines())
    cleaned = _BLANKLINES_RE.sub("\n\n", cleaned)
    return cleaned.strip()
