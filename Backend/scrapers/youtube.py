"""YouTube scraper — official Data API v3 + youtube-transcript-api."""
from __future__ import annotations

import re
from datetime import datetime
from typing import List, Optional, Tuple
from urllib.parse import parse_qs, urlparse

import httpx

from ..config import SCRAPE_TIMEOUT_SECONDS, SCRAPE_USER_AGENT, YOUTUBE_API_KEY
from .base import ScrapedItem, ScrapeError, ScrapeResult

_API_BASE = "https://www.googleapis.com/youtube/v3"


def _http() -> httpx.Client:
    return httpx.Client(
        timeout=SCRAPE_TIMEOUT_SECONDS,
        follow_redirects=True,
        headers={"User-Agent": SCRAPE_USER_AGENT},
    )


def _resolve_channel_id(handle: str) -> Tuple[str, Optional[str], Optional[str]]:
    """Returns (channel_id, channel_title, avatar_url). Accepts:
    - bare channel id "UCxxxxx"
    - "@handle"
    - full channel URL
    """
    if not YOUTUBE_API_KEY:
        raise ScrapeError("YOUTUBE_API_KEY not configured")

    h = handle.strip()

    if h.startswith("http"):
        parsed = urlparse(h)
        path = parsed.path.strip("/")
        # /channel/UCxxx
        m = re.match(r"channel/(UC[\w-]+)", path)
        if m:
            return _channel_meta(m.group(1))
        # /@handle or /c/customname or /user/legacyname
        if path.startswith("@"):
            h = path  # keep "@..."
        elif path.startswith("c/") or path.startswith("user/"):
            h = path.split("/", 1)[1]

    if h.startswith("UC") and re.fullmatch(r"UC[\w-]{20,}", h):
        return _channel_meta(h)

    handle_q = h.lstrip("@")
    with _http() as client:
        # Try the "forHandle" param first (newer API surface).
        for params in (
            {"part": "id,snippet", "forHandle": h if h.startswith("@") else f"@{handle_q}"},
            {"part": "id,snippet", "forUsername": handle_q},
        ):
            params["key"] = YOUTUBE_API_KEY
            try:
                resp = client.get(f"{_API_BASE}/channels", params=params)
                resp.raise_for_status()
                data = resp.json()
                if data.get("items"):
                    item = data["items"][0]
                    snippet = item.get("snippet", {})
                    return (
                        item["id"],
                        snippet.get("title"),
                        (snippet.get("thumbnails", {}).get("default") or {}).get("url"),
                    )
            except httpx.HTTPError:
                continue

        # Last resort: search.
        resp = client.get(
            f"{_API_BASE}/search",
            params={"part": "snippet", "q": handle_q, "type": "channel", "maxResults": 1, "key": YOUTUBE_API_KEY},
        )
        resp.raise_for_status()
        data = resp.json()
        if not data.get("items"):
            raise ScrapeError(f"YouTube channel not found for handle {handle!r}")
        item = data["items"][0]
        return (
            item["id"]["channelId"],
            item.get("snippet", {}).get("title"),
            (item.get("snippet", {}).get("thumbnails", {}).get("default") or {}).get("url"),
        )


def _channel_meta(channel_id: str) -> Tuple[str, Optional[str], Optional[str]]:
    with _http() as client:
        resp = client.get(
            f"{_API_BASE}/channels",
            params={"part": "snippet", "id": channel_id, "key": YOUTUBE_API_KEY},
        )
        resp.raise_for_status()
        items = resp.json().get("items", [])
        if not items:
            return channel_id, None, None
        snippet = items[0].get("snippet", {})
        return (
            channel_id,
            snippet.get("title"),
            (snippet.get("thumbnails", {}).get("default") or {}).get("url"),
        )


def _list_uploaded_videos(channel_id: str, max_items: int) -> List[dict]:
    with _http() as client:
        # Look up the channel's "uploads" playlist id.
        resp = client.get(
            f"{_API_BASE}/channels",
            params={"part": "contentDetails", "id": channel_id, "key": YOUTUBE_API_KEY},
        )
        resp.raise_for_status()
        items = resp.json().get("items", [])
        if not items:
            return []
        uploads_id = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

        videos: List[dict] = []
        page_token = None
        while len(videos) < max_items:
            params = {
                "part": "snippet,contentDetails",
                "playlistId": uploads_id,
                "maxResults": min(50, max_items - len(videos)),
                "key": YOUTUBE_API_KEY,
            }
            if page_token:
                params["pageToken"] = page_token
            resp = client.get(f"{_API_BASE}/playlistItems", params=params)
            resp.raise_for_status()
            data = resp.json()
            for it in data.get("items", []):
                snip = it.get("snippet", {})
                videos.append(
                    {
                        "video_id": snip.get("resourceId", {}).get("videoId"),
                        "title": snip.get("title"),
                        "description": snip.get("description") or "",
                        "published_at": snip.get("publishedAt"),
                    }
                )
            page_token = data.get("nextPageToken")
            if not page_token:
                break
        return [v for v in videos if v["video_id"]]


def _fetch_transcript(video_id: str) -> str:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi  # type: ignore
    except ImportError:
        return ""
    try:
        api = YouTubeTranscriptApi()
        transcript = api.fetch(video_id)
        parts = [snippet.text for snippet in transcript if getattr(snippet, "text", None)]
        return "\n".join(parts).strip()
    except Exception as e:
        print(f"[youtube] transcript unavailable for {video_id}: {e}")
        return ""


def _parse_iso(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return None


class YouTubeScraper:
    platform = "youtube"

    def fetch(self, handle: str, max_items: int = 25) -> ScrapeResult:
        channel_id, display_name, avatar_url = _resolve_channel_id(handle)
        videos = _list_uploaded_videos(channel_id, max_items)

        items: List[ScrapedItem] = []
        for v in videos:
            transcript = _fetch_transcript(v["video_id"])
            body_parts = [v["title"]]
            if v["description"]:
                body_parts.append(v["description"])
            if transcript:
                body_parts.append(transcript)
            text = "\n\n".join(body_parts).strip()
            if not text:
                continue
            items.append(
                ScrapedItem(
                    item_id=v["video_id"],
                    title=v["title"] or v["video_id"],
                    url=f"https://www.youtube.com/watch?v={v['video_id']}",
                    text=text,
                    published_at=_parse_iso(v.get("published_at")),
                    extra={"has_transcript": bool(transcript)},
                )
            )
        return ScrapeResult(display_name=display_name, avatar_url=avatar_url, items=items)
