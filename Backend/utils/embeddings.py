"""OpenAI embeddings + cosine similarity retrieval over the creator KB.

For Phase 1 we keep embeddings in a JSON column and do similarity in Python with
NumPy. This is fine up to ~10k chunks per creator; beyond that swap to pgvector
or sqlite-vec without changing the call sites here.
"""
from __future__ import annotations

import math
from typing import Iterable, List, Optional, Sequence, Tuple

from sqlalchemy.orm import Session

from ..config import EMBEDDING_MODEL, OPENAI_API_KEY
from ..models import CreatorKnowledgeChunk

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    if not OPENAI_API_KEY:
        return None
    try:
        from openai import OpenAI
    except ImportError:
        print("[embeddings] 'openai' package not installed; KB retrieval disabled.")
        return None
    _client = OpenAI(api_key=OPENAI_API_KEY)
    return _client


def embed_texts(texts: Sequence[str], batch_size: int = 96) -> List[Optional[List[float]]]:
    """Return one embedding per input. Items that fail return ``None`` so callers
    can persist the chunk without an embedding and retry later."""
    client = _get_client()
    if not client or not texts:
        return [None] * len(texts)

    out: List[Optional[List[float]]] = []
    for start in range(0, len(texts), batch_size):
        batch = [t[:8000] for t in texts[start : start + batch_size] if t]
        if not batch:
            out.extend([None] * (min(start + batch_size, len(texts)) - start))
            continue
        try:
            resp = client.embeddings.create(model=EMBEDDING_MODEL, input=batch)
            out.extend([d.embedding for d in resp.data])
        except Exception as e:
            print(f"[embeddings] batch failed ({start}): {e}")
            out.extend([None] * len(batch))
    return out


def embed_query(text: str) -> Optional[List[float]]:
    res = embed_texts([text])
    return res[0] if res else None


def _cosine(a: Sequence[float], b: Sequence[float]) -> float:
    dot = 0.0
    na = 0.0
    nb = 0.0
    for x, y in zip(a, b):
        dot += x * y
        na += x * x
        nb += y * y
    if na == 0 or nb == 0:
        return 0.0
    return dot / (math.sqrt(na) * math.sqrt(nb))


def _try_numpy_topk(query: Sequence[float], chunks: List[CreatorKnowledgeChunk], top_k: int):
    try:
        import numpy as np
    except ImportError:
        return None
    vectors = []
    valid: List[CreatorKnowledgeChunk] = []
    for c in chunks:
        if c.embedding:
            vectors.append(c.embedding)
            valid.append(c)
    if not vectors:
        return []
    mat = np.asarray(vectors, dtype="float32")
    q = np.asarray(query, dtype="float32")
    norms = np.linalg.norm(mat, axis=1) * np.linalg.norm(q)
    norms[norms == 0] = 1.0
    sims = (mat @ q) / norms
    idx = np.argsort(-sims)[:top_k]
    return [(valid[i], float(sims[i])) for i in idx]


def search_creator_kb(
    db: Session,
    user_id: str,
    query: str,
    top_k: int,
) -> List[Tuple[CreatorKnowledgeChunk, float]]:
    """Return up to ``top_k`` chunks most similar to ``query`` for this creator.

    Falls back to chronological newest chunks if embeddings aren't available
    (no API key, or OpenAI errored during sync).
    """
    rows = (
        db.query(CreatorKnowledgeChunk)
        .filter(CreatorKnowledgeChunk.user_id == user_id)
        .all()
    )
    rows = [r for r in rows if r.enabled is None or r.enabled]
    if not rows:
        return []

    qvec = embed_query(query)
    if not qvec:
        rows.sort(key=lambda r: r.created_at or 0, reverse=True)
        return [(r, 0.0) for r in rows[:top_k]]

    by_numpy = _try_numpy_topk(qvec, rows, top_k)
    if by_numpy is not None:
        return by_numpy

    # Pure-Python fallback.
    scored: List[Tuple[CreatorKnowledgeChunk, float]] = []
    for c in rows:
        if not c.embedding:
            continue
        scored.append((c, _cosine(qvec, c.embedding)))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_k]


def chunk_text_for_kb(text: str, size: int, overlap: int) -> List[str]:
    if not text:
        return []
    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = start + size
        piece = text[start:end].strip()
        if piece:
            chunks.append(piece)
        start = end - overlap
    return chunks
