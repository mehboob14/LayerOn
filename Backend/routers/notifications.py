"""Notifications (placeholder — no persistence yet)."""
from fastapi import APIRouter, Depends

from ..models import User
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
def list_notifications(_: User = Depends(get_current_user)):
    return []


@router.post("/{notification_id}/read")
def mark_read(notification_id: str):
    return {"read": True}


@router.delete("/{notification_id}")
def delete_notification(notification_id: str):
    return {"deleted": True}
