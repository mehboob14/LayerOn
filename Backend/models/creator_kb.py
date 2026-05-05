"""Creator-level knowledge base: external content sources and their indexed chunks."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text

from ..database import Base


class CreatorSource(Base):
    """A platform handle a creator has linked (e.g. youtube channel, substack URL)."""

    __tablename__ = "creator_sources"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Platform identifier: "medium" | "substack" | "youtube" | "rss"
    platform = Column(String, nullable=False)

    # The user-supplied locator: handle (@user), URL, or channel ID — interpretation
    # is platform-specific and resolved by the matching scraper.
    handle = Column(Text, nullable=False)

    # Cached display info pulled from the platform on first sync.
    display_name = Column(String, nullable=True)
    avatar_url = Column(Text, nullable=True)

    # Sync state machine: "pending" | "syncing" | "synced" | "error"
    status = Column(String, default="pending", nullable=False)
    last_synced_at = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
    item_count = Column(Integer, default=0, nullable=False)

    # Whether this source feeds into the global creator KB used by chat.
    enabled = Column(JSON, nullable=True)  # bool stored as JSON for SQLite friendliness

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CreatorKnowledgeChunk(Base):
    """An embedded text chunk from one of the creator's external sources."""

    __tablename__ = "creator_knowledge_chunks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(String, ForeignKey("creator_sources.id", ondelete="CASCADE"), nullable=False, index=True)

    # Origin metadata so we can cite it back to the user.
    source_item_id = Column(String, nullable=True)  # platform-native id (video id, post slug)
    title = Column(Text, nullable=True)
    url = Column(Text, nullable=True)
    published_at = Column(DateTime, nullable=True)

    chunk_index = Column(Integer, nullable=False, default=0)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0, nullable=False)

    # OpenAI text-embedding-3-small returns 1536 floats; stored as JSON list.
    embedding = Column(JSON, nullable=True)
    embedding_model = Column(String, nullable=True)

    # Creator can mute individual chunks without re-syncing.
    enabled = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
