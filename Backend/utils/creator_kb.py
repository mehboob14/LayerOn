"""Sync orchestration for creator sources → knowledge chunks."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from ..config import (
    CREATOR_CHUNK_OVERLAP,
    CREATOR_CHUNK_SIZE,
    CREATOR_KB_MAX_CHARS,
    EMBEDDING_MODEL,
)
from ..database import SessionLocal
from ..models import CreatorKnowledgeChunk, CreatorSource
from ..scrapers import ScrapeError, get_scraper
from .embeddings import chunk_text_for_kb, embed_texts, search_creator_kb


def _set_status(db: Session, source: CreatorSource, status: str, error: str | None = None) -> None:
    source.status = status
    source.last_error = error
    source.updated_at = datetime.utcnow()
    db.commit()


def sync_source(source_id: str) -> None:
    """Run a full re-sync for a single source. Safe to run in BackgroundTasks.

    Opens its own DB session so it works detached from the request lifecycle.
    """
    db = SessionLocal()
    try:
        source = db.query(CreatorSource).filter(CreatorSource.id == source_id).first()
        if not source:
            return

        _set_status(db, source, "syncing")

        try:
            scraper = get_scraper(source.platform)
            result = scraper.fetch(source.handle)
        except ScrapeError as e:
            _set_status(db, source, "error", error=str(e))
            return
        except Exception as e:  # noqa: BLE001 — last-resort guard for unknown failures
            _set_status(db, source, "error", error=f"unexpected: {e}")
            return

        if result.display_name and not source.display_name:
            source.display_name = result.display_name
        if result.avatar_url and not source.avatar_url:
            source.avatar_url = result.avatar_url

        # Replace this source's chunks atomically (idempotent re-sync).
        db.query(CreatorKnowledgeChunk).filter(
            CreatorKnowledgeChunk.source_id == source.id
        ).delete()

        # 1. Build chunk records with empty embeddings.
        pending: List[CreatorKnowledgeChunk] = []
        texts_to_embed: List[str] = []
        for item in result.items:
            pieces = chunk_text_for_kb(item.text, CREATOR_CHUNK_SIZE, CREATOR_CHUNK_OVERLAP)
            for idx, piece in enumerate(pieces):
                chunk = CreatorKnowledgeChunk(
                    id=str(uuid.uuid4()),
                    user_id=source.user_id,
                    source_id=source.id,
                    source_item_id=item.item_id,
                    title=item.title,
                    url=item.url,
                    published_at=item.published_at,
                    chunk_index=idx,
                    content=piece,
                    token_count=len(piece.split()),
                    embedding_model=EMBEDDING_MODEL,
                )
                pending.append(chunk)
                texts_to_embed.append(piece)

        # 2. Embed in batches and persist.
        embeddings = embed_texts(texts_to_embed) if texts_to_embed else []
        for chunk, vec in zip(pending, embeddings):
            chunk.embedding = vec
            db.add(chunk)

        source.item_count = len(result.items)
        source.last_synced_at = datetime.utcnow()
        _set_status(db, source, "synced")
    finally:
        db.close()


def build_creator_context(db: Session, user_id: str, query: str, top_k: int) -> str:
    """Return a formatted RAG block for the chat system prompt."""
    hits = search_creator_kb(db, user_id, query, top_k)
    if not hits:
        return ""

    blocks = []
    total = 0
    for chunk, score in hits:
        header = f"[from {chunk.title or 'untitled'}]"
        if chunk.url:
            header += f" ({chunk.url})"
        body = chunk.content
        block = f"{header}\n{body}"
        if total + len(block) > CREATOR_KB_MAX_CHARS:
            break
        blocks.append(block)
        total += len(block)

    return "\n\n---\n\n".join(blocks)
