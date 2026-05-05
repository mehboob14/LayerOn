"""Module CRUD."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Module, ModuleDocument, User
from ..schemas import ModuleCreateRequest, ModuleUpdateRequest
from ..utils.auth import get_current_user
from ..utils.serializers import doc_to_dict, module_to_dict, user_to_dict

router = APIRouter(prefix="/api", tags=["modules"])


def _attach_creator(db: Session, module: Module, payload: dict) -> dict:
    creator = db.query(User).filter(User.id == module.creator_id).first()
    payload["creator"] = (
        user_to_dict(creator)
        if creator
        else {"id": module.creator_id, "email": "unknown", "firstName": "Creator"}
    )
    return payload


@router.post("/modules")
def create_module(
    req: ModuleCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    module = Module(
        id=str(uuid.uuid4()),
        creator_id=user.id,
        title=req.title,
        description=req.description,
        instructions=req.instructions,
        provider=req.provider,
        model=req.model,
        conversation_starters=req.conversation_starters,
        capabilities=req.capabilities,
        is_public=req.is_public,
        featured=req.featured,
        image_url=req.image_url,
        api_schema=req.api_schema,
        custom_fields=req.custom_fields,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module_to_dict(module)


@router.get("/modules")
def list_modules(db: Session = Depends(get_db)):
    mods = (
        db.query(Module)
        .filter(Module.is_public == True)  # noqa: E712
        .order_by(Module.usage_count.desc())
        .all()
    )
    return [_attach_creator(db, m, module_to_dict(m)) for m in mods]


@router.get("/modules/featured")
def featured_modules(db: Session = Depends(get_db)):
    mods = (
        db.query(Module)
        .filter(Module.is_public == True, Module.featured == True)  # noqa: E712
        .limit(10)
        .all()
    )
    return [_attach_creator(db, m, module_to_dict(m)) for m in mods]


@router.get("/modules/{module_id}")
def get_module(module_id: str, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    payload = _attach_creator(db, module, module_to_dict(module))
    docs = db.query(ModuleDocument).filter(ModuleDocument.module_id == module_id).all()
    payload["documents"] = [doc_to_dict(d) for d in docs]
    return payload


@router.patch("/modules/{module_id}")
def update_module(
    module_id: str,
    req: ModuleUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    if module.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for key, value in req.dict(exclude_unset=True).items():
        setattr(module, key, value)
    module.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(module)
    return module_to_dict(module)


@router.get("/my-modules")
def my_modules(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    mods = db.query(Module).filter(Module.creator_id == user.id).all()
    return [module_to_dict(m) for m in mods]
