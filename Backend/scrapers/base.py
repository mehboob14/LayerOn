"""Shared scraper contract."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Protocol


class ScrapeError(Exception):
    """Raised by scrapers when a source can't be fetched/parsed."""


@dataclass
class ScrapedItem:
    """One unit of creator content (a post, a video, an episode)."""

    item_id: str  # platform-native id (URL slug, video id, etc.)
    title: str
    url: str
    text: str  # cleaned plain-text body / transcript
    published_at: Optional[datetime] = None
    extra: dict = field(default_factory=dict)


@dataclass
class ScrapeResult:
    display_name: Optional[str]
    avatar_url: Optional[str]
    items: List[ScrapedItem]


class Scraper(Protocol):
    platform: str

    def fetch(self, handle: str, max_items: int = 50) -> ScrapeResult:
        """Fetch up to ``max_items`` recent items for ``handle``.

        ``handle`` is the user-supplied locator (URL, @handle, channel id).
        Implementations must raise ``ScrapeError`` on hard failure.
        """
        ...
