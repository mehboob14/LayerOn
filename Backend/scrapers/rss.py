"""Generic RSS/Atom feed scraper used directly and as a building block."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

import httpx

from ..config import SCRAPE_TIMEOUT_SECONDS, SCRAPE_USER_AGENT
from ._html import html_to_text
from .base import ScrapedItem, ScrapeError, ScrapeResult


def fetch_feed(url: str) -> dict:
    try:
        import feedparser  # type: ignore
    except ImportError as e:
        raise ScrapeError("feedparser is not installed") from e

    headers = {"User-Agent": SCRAPE_USER_AGENT, "Accept": "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8"}
    try:
        with httpx.Client(timeout=SCRAPE_TIMEOUT_SECONDS, follow_redirects=True, headers=headers) as client:
            resp = client.get(url)
            resp.raise_for_status()
            body = resp.content
    except httpx.HTTPError as e:
        raise ScrapeError(f"feed request failed: {e}") from e

    parsed = feedparser.parse(body)
    if parsed.bozo and not parsed.entries:
        raise ScrapeError(f"feed unreadable: {parsed.bozo_exception}")
    return parsed


def _entry_published(entry: dict) -> Optional[datetime]:
    for key in ("published_parsed", "updated_parsed"):
        val = entry.get(key)
        if val:
            try:
                return datetime(*val[:6])
            except (TypeError, ValueError):
                pass
    return None


def _entry_text(entry: dict) -> str:
    parts: List[str] = []
    if entry.get("content"):
        for c in entry["content"]:
            if c.get("value"):
                parts.append(c["value"])
    if entry.get("summary"):
        parts.append(entry["summary"])
    if entry.get("description"):
        parts.append(entry["description"])
    return html_to_text("\n\n".join(parts))


def parse_feed_to_items(parsed: dict, max_items: int) -> List[ScrapedItem]:
    items: List[ScrapedItem] = []
    for entry in parsed.entries[:max_items]:
        url = entry.get("link") or ""
        item_id = entry.get("id") or url
        title = entry.get("title") or "(untitled)"
        text = _entry_text(entry)
        if not text:
            continue
        items.append(
            ScrapedItem(
                item_id=item_id,
                title=title,
                url=url,
                text=text,
                published_at=_entry_published(entry),
            )
        )
    return items


def feed_display_name(parsed: dict) -> Optional[str]:
    feed = parsed.get("feed", {})
    return feed.get("title") or feed.get("subtitle")


class GenericRSSScraper:
    platform = "rss"

    def fetch(self, handle: str, max_items: int = 50) -> ScrapeResult:
        url = handle.strip()
        if not url:
            raise ScrapeError("RSS URL required")
        parsed = fetch_feed(url)
        return ScrapeResult(
            display_name=feed_display_name(parsed),
            avatar_url=None,
            items=parse_feed_to_items(parsed, max_items),
        )
