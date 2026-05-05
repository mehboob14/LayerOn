"""Module ORM model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text

from ..database import Base


class Module(Base):
    __tablename__ = "modules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    creator_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=False, default="")
    instructions = Column(Text, nullable=False, default="")
    image_url = Column(Text, nullable=True)
    provider = Column(Text, nullable=False, default="openai")
    model = Column(Text, nullable=False, default="gpt-4o-mini")
    recommended_model = Column(Text, nullable=True)
    conversation_starters = Column(JSON, nullable=True)
    capabilities = Column(JSON, nullable=True)
    knowledge = Column(JSON, nullable=True)
    actions = Column(JSON, nullable=True)
    api_schema = Column(JSON, nullable=True)
    custom_fields = Column(JSON, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    featured = Column(Boolean, default=False, nullable=False)
    usage_count = Column(Integer, default=0, nullable=False)
    favorite_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
