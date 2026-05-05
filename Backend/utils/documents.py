"""Document text extraction, chunking and RAG context retrieval."""
from __future__ import annotations

import io
from typing import List

from sqlalchemy.orm import Session

from ..config import CHUNK_OVERLAP, CHUNK_SIZE, RAG_CONTEXT_CHAR_LIMIT
from ..models import DocumentChunk


def extract_text_from_file(file_bytes: bytes, filename: str, mime_type: str) -> str:
    name = (filename or "").lower()
    mime = mime_type or ""

    if mime == "application/pdf" or name.endswith(".pdf"):
        try:
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(file_bytes))
            parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    parts.append(page_text)
            return "\n".join(parts).strip()
        except Exception as e:
            return f"[PDF extraction failed: {e}]"

    if mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or name.endswith(".docx"):
        try:
            from docx import Document

            doc = Document(io.BytesIO(file_bytes))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()
        except Exception as e:
            return f"[DOCX extraction failed: {e}]"

    if mime.startswith("text/") or name.endswith((".txt", ".md", ".csv", ".json")):
        try:
            return file_bytes.decode("utf-8").strip()
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1").strip()

    return f"[Unsupported file type: {mime_type}]"


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    if not text:
        return []
    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap
    return chunks


def get_document_context(db: Session, module_id: str, _user_message: str = "") -> str:
    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.module_id == module_id)
        .order_by(DocumentChunk.chunk_index)
        .all()
    )
    if not chunks:
        return ""

    joined = "\n\n".join(c.content for c in chunks)
    if len(joined) > RAG_CONTEXT_CHAR_LIMIT:
        joined = joined[:RAG_CONTEXT_CHAR_LIMIT] + "\n\n[... document truncated for context ...]"
    return joined
