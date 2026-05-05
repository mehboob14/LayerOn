"""Platform scrapers: pull recent content from a creator's external profile.

Each scraper implements ``Scraper`` and returns a list of ``ScrapedItem``.
The router/sync layer is responsible for chunking, embedding and persisting.
"""
from .base import Scraper, ScrapedItem, ScrapeError
from .medium import MediumScraper
from .substack import SubstackScraper
from .youtube import YouTubeScraper
from .rss import GenericRSSScraper


def get_scraper(platform: str) -> Scraper:
    platform = (platform or "").lower().strip()
    if platform == "medium":
        return MediumScraper()
    if platform == "substack":
        return SubstackScraper()
    if platform == "youtube":
        return YouTubeScraper()
    if platform == "rss":
        return GenericRSSScraper()
    raise ScrapeError(f"Unsupported platform: {platform!r}")


SUPPORTED_PLATFORMS = ["medium", "substack", "youtube", "rss"]

__all__ = [
    "Scraper",
    "ScrapedItem",
    "ScrapeError",
    "get_scraper",
    "SUPPORTED_PLATFORMS",
]
