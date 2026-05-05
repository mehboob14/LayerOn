"""Chat endpoints (RAG-aware)."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from sqlalchemy.orm import Session

from ..config import CHAT_CREDIT_COST, CREATOR_KB_TOP_K
from ..database import get_db
from ..models import Conversation, Message, Module, User
from ..schemas import ChatRequest
from ..utils.auth import get_current_user
from ..utils.creator_kb import build_creator_context
from ..utils.documents import get_document_context
from ..utils.llm import get_llm_for_module

router = APIRouter(prefix="/api", tags=["chat"])


def _build_system_prompt(db: Session, module: Module, user_query: str) -> str:
    prompt = module.instructions or "You are a helpful assistant."

    module_context = get_document_context(db, module.id)
    if module_context:
        prompt += (
            "\n\n--- MODULE KNOWLEDGE (uploaded by the creator for this module) ---\n"
            "Use the following document content to inform your responses when relevant:\n\n"
            f"{module_context}\n\n--- END MODULE KNOWLEDGE ---"
        )

    # Bring in the creator's general knowledge base (their own writing/videos)
    # so the module speaks with the creator's voice and references their work.
    creator_context = build_creator_context(db, module.creator_id, user_query, CREATOR_KB_TOP_K)
    if creator_context:
        prompt += (
            "\n\n--- CREATOR BACKGROUND (the creator's public work; cite when natural) ---\n"
            f"{creator_context}\n\n--- END CREATOR BACKGROUND ---"
        )
    return prompt


def _history(db: Session, conversation_id: str) -> list:
    rows = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    out = []
    for m in rows:
        if m.role == "user":
            out.append(HumanMessage(content=m.content))
        elif m.role == "assistant":
            out.append(AIMessage(content=m.content))
    return out


def _invoke_llm(module: Module, system: str, history: list, user_text: str) -> str:
    llm = get_llm_for_module(module)
    msgs = [SystemMessage(content=system), *history, HumanMessage(content=user_text)]
    try:
        return llm.invoke(msgs).content
    except Exception as e:
        return f"I apologize, but I encountered an error processing your request. Please try again. (Error: {str(e)[:100]})"


@router.post("/chat")
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not payload.message:
        raise HTTPException(status_code=400, detail="Message is required")

    module = db.query(Module).filter(Module.id == payload.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    system_prompt = _build_system_prompt(db, module, payload.message)

    conversation_id = payload.conversation_id
    if not conversation_id:
        conv = Conversation(
            id=str(uuid.uuid4()),
            user_id=user.id,
            module_id=module.id,
            title=payload.message[:50] + ("..." if len(payload.message) > 50 else ""),
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conversation_id = conv.id
    else:
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

    history = _history(db, conversation_id)
    ai_content = _invoke_llm(module, system_prompt, history, payload.message)

    user_msg = Message(
        id=str(uuid.uuid4()), conversation_id=conversation_id, role="user", content=payload.message,
    )
    ai_msg = Message(
        id=str(uuid.uuid4()), conversation_id=conversation_id, role="assistant", content=ai_content,
    )
    db.add(user_msg)
    db.add(ai_msg)

    conv.updated_at = datetime.utcnow()
    if conv.title == "New Conversation":
        conv.title = payload.message[:50] + ("..." if len(payload.message) > 50 else "")
    conv.total_tokens_used = (conv.total_tokens_used or 0) + len(payload.message.split()) + len(ai_content.split())
    conv.credits_cost = (conv.credits_cost or 0) + CHAT_CREDIT_COST

    module.usage_count = (module.usage_count or 0) + 1
    module.updated_at = datetime.utcnow()
    db.commit()

    return {
        "conversationId": conversation_id,
        "message": {
            "id": ai_msg.id,
            "role": "assistant",
            "content": ai_content,
            "createdAt": ai_msg.created_at.isoformat() if ai_msg.created_at else None,
        },
    }


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    body = await request.json()
    message_text = body.get("message", "")
    if not message_text:
        raise HTTPException(status_code=400, detail="Message is required")

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    module = db.query(Module).filter(Module.id == conv.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    system_prompt = _build_system_prompt(db, module, message_text)
    history = _history(db, conversation_id)
    ai_content = _invoke_llm(module, system_prompt, history, message_text)

    db.add(Message(id=str(uuid.uuid4()), conversation_id=conversation_id, role="user", content=message_text))
    ai_msg = Message(id=str(uuid.uuid4()), conversation_id=conversation_id, role="assistant", content=ai_content)
    db.add(ai_msg)

    conv.updated_at = datetime.utcnow()
    conv.total_tokens_used = (conv.total_tokens_used or 0) + len(message_text.split()) + len(ai_content.split())
    conv.credits_cost = (conv.credits_cost or 0) + CHAT_CREDIT_COST
    module.usage_count = (module.usage_count or 0) + 1
    db.commit()

    return {
        "conversationId": conversation_id,
        "message": {
            "id": ai_msg.id,
            "role": "assistant",
            "content": ai_content,
            "createdAt": ai_msg.created_at.isoformat() if ai_msg.created_at else None,
        },
    }
