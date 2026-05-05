"""Substack scraper — every Substack publication exposes /feed."""
from __future__ import annotations

from urllib.parse import urlparse

from .base import ScrapeError, ScrapeResult
from .rss import fetch_feed, feed_display_name, parse_feed_to_items


def _resolve_feed_url(handle: str) -> str:
    h = handle.strip()
    if not h:
        raise ScrapeError("Substack handle required")

    if h.startswith("http://") or h.startswith("https://"):
        if "/feed" in h:
            return h
        return h.rstrip("/") + "/feed"

    sub = h.replace(".substack.com", "").lstrip("@")
    return f"https://{sub}.substack.com/feed"


class SubstackScraper:
    platform = "substack"

    def fetch(self, handle: str, max_items: int = 50) -> ScrapeResult:
        url = _resolve_feed_url(handle)
        parsed = fetch_feed(url)
        return ScrapeResult(
            display_name=feed_display_name(parsed),
            avatar_url=parsed.get("feed", {}).get("image", {}).get("href"),
            items=parse_feed_to_items(parsed, max_items),
        )
