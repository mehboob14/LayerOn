"""Convert ORM rows to camelCase dicts for API responses."""
from __future__ import annotations

from sqlalchemy.orm import Session

from ..models import Conversation, Message, Module, ModuleDocument, User


def user_to_dict(user: User | None) -> dict:
    if not user:
        return {}
    return {
        "id": user.id,
        "clerkId": user.clerk_id,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "profilePictureUrl": user.profile_picture_url,
        "credits": user.credits,
        "role": user.role or "user",
        "profession": user.profession,
        "bio": user.bio,
        "headline": user.headline,
        "expertise": user.expertise,
        "website": user.website,
        "twitter": user.twitter,
        "linkedin": user.linkedin,
        "onboardedAt": user.onboarded_at.isoformat() if user.onboarded_at else None,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    }


def creator_source_to_dict(source) -> dict:
    return {
        "id": source.id,
        "userId": source.user_id,
        "platform": source.platform,
        "handle": source.handle,
        "displayName": source.display_name,
        "avatarUrl": source.avatar_url,
        "status": source.status,
        "lastSyncedAt": source.last_synced_at.isoformat() if source.last_synced_at else None,
        "lastError": source.last_error,
        "itemCount": source.item_count,
        "enabled": source.enabled if source.enabled is not None else True,
        "createdAt": source.created_at.isoformat() if source.created_at else None,
        "updatedAt": source.updated_at.isoformat() if source.updated_at else None,
    }


def creator_chunk_to_dict(chunk) -> dict:
    return {
        "id": chunk.id,
        "sourceId": chunk.source_id,
        "title": chunk.title,
        "url": chunk.url,
        "publishedAt": chunk.published_at.isoformat() if chunk.published_at else None,
        "chunkIndex": chunk.chunk_index,
        "contentPreview": (chunk.content[:280] + "…") if chunk.content and len(chunk.content) > 280 else chunk.content,
        "tokenCount": chunk.token_count,
        "enabled": chunk.enabled if chunk.enabled is not None else True,
        "hasEmbedding": bool(chunk.embedding),
    }


def module_to_dict(module: Module) -> dict:
    return {
        "id": module.id,
        "creatorId": module.creator_id,
        "title": module.title,
        "description": module.description,
        "instructions": module.instructions,
        "imageUrl": module.image_url,
        "provider": module.provider,
        "model": module.model,
        "conversationStarters": module.conversation_starters,
        "capabilities": module.capabilities,
        "apiSchema": module.api_schema,
        "customFields": module.custom_fields,
        "isPublic": module.is_public,
        "featured": module.featured,
        "usageCount": module.usage_count,
        "favoriteCount": module.favorite_count,
        "createdAt": module.created_at.isoformat() if module.created_at else None,
        "updatedAt": module.updated_at.isoformat() if module.updated_at else None,
    }


def doc_to_dict(doc: ModuleDocument) -> dict:
    return {
        "id": doc.id,
        "moduleId": doc.module_id,
        "fileName": doc.file_name,
        "fileSize": doc.file_size,
        "mimeType": doc.mime_type,
        "isProcessed": doc.is_processed,
        "createdAt": doc.created_at.isoformat() if doc.created_at else None,
    }


def message_to_dict(m: Message) -> dict:
    return {
        "id": m.id,
        "role": m.role,
        "content": m.content,
        "createdAt": m.created_at.isoformat() if m.created_at else None,
    }


def conversation_to_dict(conv: Conversation, db: Session) -> dict:
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return {
        "id": conv.id,
        "userId": conv.user_id,
        "moduleId": conv.module_id,
        "title": conv.title,
        "totalTokensUsed": conv.total_tokens_used,
        "creditsCost": conv.credits_cost,
        "messages": [message_to_dict(m) for m in messages],
        "createdAt": conv.created_at.isoformat() if conv.created_at else None,
        "updatedAt": conv.updated_at.isoformat() if conv.updated_at else None,
    }
