"""Favorites (placeholder — no persistence yet)."""
from fastapi import APIRouter, Depends

from ..models import User
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api", tags=["favorites"])


@router.post("/modules/{module_id}/favorite")
def add_favorite(module_id: str, _: User = Depends(get_current_user)):
    return {"favorited": True}


@router.delete("/modules/{module_id}/favorite")
def remove_favorite(module_id: str, _: User = Depends(get_current_user)):
    return {"unfavorited": True}


@router.get("/favorites")
def list_favorites(_: User = Depends(get_current_user)):
    return []
