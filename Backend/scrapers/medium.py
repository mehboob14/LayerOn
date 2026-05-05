"""Medium scraper — uses the public per-user RSS feed."""
from __future__ import annotations

from urllib.parse import urlparse

from .base import ScrapeError, ScrapeResult
from .rss import fetch_feed, feed_display_name, parse_feed_to_items


def _resolve_feed_url(handle: str) -> str:
    h = handle.strip()
    if not h:
        raise ScrapeError("Medium handle required")

    if h.startswith("http://") or h.startswith("https://"):
        parsed = urlparse(h)
        path = parsed.path.strip("/")
        if path.startswith("@"):
            return f"https://medium.com/feed/{path}"
        # Custom-domain or publication: append /feed.
        if path.endswith("/feed"):
            return h
        return h.rstrip("/") + "/feed"

    if h.startswith("@"):
        return f"https://medium.com/feed/{h}"
    return f"https://medium.com/feed/@{h.lstrip('@')}"


class MediumScraper:
    platform = "medium"

    def fetch(self, handle: str, max_items: int = 50) -> ScrapeResult:
        url = _resolve_feed_url(handle)
        parsed = fetch_feed(url)
        return ScrapeResult(
            display_name=feed_display_name(parsed),
            avatar_url=parsed.get("feed", {}).get("image", {}).get("href"),
            items=parse_feed_to_items(parsed, max_items),
        )
