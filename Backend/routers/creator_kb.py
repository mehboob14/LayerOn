"""Creator knowledge-base management: external sources, sync, web identity."""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CreatorKnowledgeChunk, CreatorSource, User
from ..schemas import (
    CreatorChunkUpdate,
    CreatorSourceCreate,
    CreatorSourceUpdate,
    WebIdentityRequest,
)
from ..scrapers import SUPPORTED_PLATFORMS
from ..utils.auth import get_current_user
from ..utils.creator_kb import sync_source
from ..utils.serializers import creator_chunk_to_dict, creator_source_to_dict
from ..utils.web_identity import discover_identity, is_enabled as identity_enabled

router = APIRouter(prefix="/api/creator", tags=["creator-kb"])


def _require_creator(user: User) -> None:
    # Enforce role; modules already require creator implicitly via ownership,
    # but the KB is creator-only by design.
    if user.role != "creator":
        raise HTTPException(status_code=403, detail="Creator role required")


def _load_source(db: Session, user: User, source_id: str) -> CreatorSource:
    source = db.query(CreatorSource).filter(CreatorSource.id == source_id).first()
    if not source or source.user_id != user.id:
        raise HTTPException(status_code=404, detail="Source not found")
    return source


@router.get("/platforms")
def list_platforms():
    return {
        "supported": SUPPORTED_PLATFORMS,
        "webIdentityEnabled": identity_enabled(),
    }


@router.get("/sources")
def list_sources(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _require_creator(user)
    sources = (
        db.query(CreatorSource)
        .filter(CreatorSource.user_id == user.id)
        .order_by(CreatorSource.created_at.desc())
        .all()
    )
    return [creator_source_to_dict(s) for s in sources]


@router.post("/sources", status_code=201)
def add_source(
    req: CreatorSourceCreate,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_creator(user)
    if req.platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {req.platform}")
    if not req.handle.strip():
        raise HTTPException(status_code=400, detail="Handle is required")

    existing = (
        db.query(CreatorSource)
        .filter(
            CreatorSource.user_id == user.id,
            CreatorSource.platform == req.platform,
            CreatorSource.handle == req.handle.strip(),
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Source already linked")

    source = CreatorSource(
        id=str(uuid.uuid4()),
        user_id=user.id,
        platform=req.platform,
        handle=req.handle.strip(),
        enabled=req.enabled,
        status="pending",
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    background.add_task(sync_source, source.id)
    return creator_source_to_dict(source)


@router.patch("/sources/{source_id}")
def update_source(
    source_id: str,
    req: CreatorSourceUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_creator(user)
    source = _load_source(db, user, source_id)
    if req.handle is not None:
        source.handle = req.handle.strip()
    if req.enabled is not None:
        source.enabled = req.enabled
    db.commit()
    db.refresh(source)
    return creator_source_to_dict(source)


@router.delete("/sources/{source_id}")
def delete_source(
    source_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_creator(user)
    source = _load_source(db, user, source_id)
    db.query(CreatorKnowledgeChunk).filter(
        CreatorKnowledgeChunk.source_id == source.id
    ).delete()
    db.delete(source)
    db.commit()
    return {"deleted": True}


@router.post("/sources/{source_id}/sync")
def trigger_sync(
    source_id: str,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_creator(user)
    source = _load_source(db, user, source_id)
    source.status = "pending"
    source.last_error = None
    db.commit()
    background.add_task(sync_source, source.id)
    return {"queued": True, "sourceId": source.id}


@router.get("/sources/{source_id}/chunks")
def list_source_chunks(
    source_id: str,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_creator(user)
    source = _load_source(db, user, source_id)
    chunks = (
        db.query(CreatorKnowledgeChunk)
        .filter(CreatorKnowledgeChunk.source_id == source.id)
        .order_by(CreatorKnowledgeChunk.published_at.desc().nullslast(), CreatorKnowledgeChunk.chunk_index.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    total = (
        db.query(CreatorKnowledgeChunk)
        .filter(CreatorKnowledgeChunk.source_id == source.id)
        .count()
    )
    return {
        "total": total,
        "chunks": [creator_chunk_to_dict(c) for c in chunks],
    }


@router.patch("/chunks/{chunk_id}")
def toggle_chunk(
    chunk_id: str,
    req: CreatorChunkUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_creator(user)
    chunk = db.query(CreatorKnowledgeChunk).filter(CreatorKnowledgeChunk.id == chunk_id).first()
    if not chunk or chunk.user_id != user.id:
        raise HTTPException(status_code=404, detail="Chunk not found")
    chunk.enabled = req.enabled
    db.commit()
    return creator_chunk_to_dict(chunk)


@router.delete("/chunks/{chunk_id}")
def delete_chunk(
    chunk_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_creator(user)
    chunk = db.query(CreatorKnowledgeChunk).filter(CreatorKnowledgeChunk.id == chunk_id).first()
    if not chunk or chunk.user_id != user.id:
        raise HTTPException(status_code=404, detail="Chunk not found")
    db.delete(chunk)
    db.commit()
    return {"deleted": True}


@router.get("/kb/summary")
def kb_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _require_creator(user)
    sources = db.query(CreatorSource).filter(CreatorSource.user_id == user.id).all()
    total_chunks = (
        db.query(CreatorKnowledgeChunk)
        .filter(CreatorKnowledgeChunk.user_id == user.id)
        .count()
    )
    return {
        "sourceCount": len(sources),
        "chunkCount": total_chunks,
        "byStatus": {
            status: sum(1 for s in sources if s.status == status)
            for status in ("pending", "syncing", "synced", "error")
        },
    }


@router.post("/discover")
def web_discover(
    req: WebIdentityRequest,
    user: User = Depends(get_current_user),
):
    _require_creator(user)
    name = (req.name or f"{user.first_name or ''} {user.last_name or ''}").strip() or user.email
    hints = req.hints or []
    if user.profession:
        hints.append(user.profession)
    if user.headline:
        hints.append(user.headline)
    return discover_identity(name, hints)
