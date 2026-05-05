"""Web identity discovery via Tavily (feature-flagged)."""
from __future__ import annotations

from typing import List, Optional

import httpx

from ..config import SCRAPE_TIMEOUT_SECONDS, TAVILY_API_KEY


def is_enabled() -> bool:
    return bool(TAVILY_API_KEY)


def discover_identity(name: str, hints: Optional[List[str]] = None) -> dict:
    """Search the web for a creator's public identity. Returns a structured
    payload the frontend can render. Returns ``{"enabled": False}`` when no API
    key is configured.
    """
    if not TAVILY_API_KEY:
        return {"enabled": False, "results": [], "summary": ""}

    query_parts = [name.strip()]
    if hints:
        query_parts.extend(h for h in hints if h)
    query = " ".join(query_parts).strip()
    if not query:
        return {"enabled": True, "results": [], "summary": ""}

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": f"{query} (creator profile, social accounts, professional background)",
        "search_depth": "basic",
        "include_answer": True,
        "max_results": 8,
    }

    try:
        with httpx.Client(timeout=SCRAPE_TIMEOUT_SECONDS) as client:
            resp = client.post("https://api.tavily.com/search", json=payload)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError as e:
        return {"enabled": True, "results": [], "summary": "", "error": str(e)}

    results = []
    for r in data.get("results", []):
        results.append(
            {
                "title": r.get("title"),
                "url": r.get("url"),
                "snippet": r.get("content"),
                "score": r.get("score"),
            }
        )
    return {
        "enabled": True,
        "summary": data.get("answer") or "",
        "results": results,
    }
