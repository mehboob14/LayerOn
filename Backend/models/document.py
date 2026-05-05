"""Module document and chunk ORM models."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text

from ..database import Base


class ModuleDocument(Base):
    __tablename__ = "module_documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    module_id = Column(String, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(Text, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(Text, nullable=False)
    file_content = Column(Text, nullable=False)
    is_processed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), nullable=False)
    module_id = Column(String, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
