"""Conversation CRUD."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Conversation, Message, Module, User
from ..schemas import ConversationCreateRequest
from ..utils.auth import get_current_user
from ..utils.serializers import conversation_to_dict

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.post("")
def create_conversation(
    req: ConversationCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    module = db.query(Module).filter(Module.id == req.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    conv = Conversation(
        id=str(uuid.uuid4()),
        user_id=user.id,
        module_id=req.module_id,
        title=req.title or "New Conversation",
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conversation_to_dict(conv, db)


@router.get("")
def list_conversations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return [conversation_to_dict(c, db) for c in convs]


@router.get("/{conversation_id}")
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return conversation_to_dict(conv, db)


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conv and conv.user_id == user.id:
        db.query(Message).filter(Message.conversation_id == conversation_id).delete()
        db.query(Conversation).filter(Conversation.id == conversation_id).delete()
        db.commit()
    return {"deleted": True}
