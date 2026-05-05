from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Module, User
from ..utils.serializers import module_to_dict, user_to_dict

router = APIRouter(prefix="/api/creators", tags=["creators"])


@router.get("")
def list_creators(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(User).filter(User.role == "creator")
    if search:
        like = f"%{search}%"
        query = query.filter(
            (User.first_name.ilike(like))
            | (User.last_name.ilike(like))
            | (User.headline.ilike(like))
            | (User.email.ilike(like))
        )
    creators = query.order_by(User.created_at.desc()).limit(50).all()
    return [user_to_dict(c) for c in creators]


@router.get("/{user_id}")
def get_creator_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Creator not found")

    modules = (
        db.query(Module)
        .filter(Module.creator_id == user_id, Module.is_public == True)  # noqa: E712
        .order_by(Module.usage_count.desc())
        .all()
    )
    return {
        "user": user_to_dict(user),
        "modules": [module_to_dict(m) for m in modules],
    }
