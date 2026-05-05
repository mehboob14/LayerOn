"""Auth: Clerk sync, profile."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..config import DEFAULT_USER_CREDITS
from ..database import get_db
from ..models import User
from ..schemas import ProfileUpdateRequest, UserSyncRequest
from ..utils.auth import get_current_user, verify_clerk_token
from ..utils.serializers import user_to_dict

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _email_from_claims(claims: dict, clerk_id: str) -> str:
    email = claims.get("email", "")
    if not email and isinstance(claims.get("email_addresses"), list):
        first = claims["email_addresses"][0] if claims["email_addresses"] else {}
        email = first.get("email_address", "")
    if not email:
        email = claims.get("metadata", {}).get("email", f"{clerk_id}@clerk.user")
    return email


@router.post("/sync")
def sync_user(req: UserSyncRequest, request: Request, db: Session = Depends(get_db)):
    claims = verify_clerk_token(request)
    if not claims:
        raise HTTPException(status_code=401, detail="Not authenticated")

    clerk_id = claims.get("sub")
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = _email_from_claims(claims, clerk_id)

    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if user:
        if req.role and req.role in ("creator", "user"):
            user.role = req.role
        db.commit()
        db.refresh(user)
        return user_to_dict(user)

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        existing.clerk_id = clerk_id
        if req.role and req.role in ("creator", "user"):
            existing.role = req.role
        db.commit()
        db.refresh(existing)
        return user_to_dict(existing)

    user = User(
        id=str(uuid.uuid4()),
        clerk_id=clerk_id,
        email=email,
        first_name=claims.get("first_name") or claims.get("given_name") or "",
        last_name=claims.get("last_name") or claims.get("family_name") or "",
        profile_picture_url=claims.get("image_url") or claims.get("profile_image_url") or "",
        credits=DEFAULT_USER_CREDITS,
        role=req.role if req.role in ("creator", "user") else "user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user_to_dict(user)


@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return user_to_dict(user)


@router.patch("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    field_map = {
        "firstName": "first_name",
        "lastName": "last_name",
        "profession": "profession",
        "bio": "bio",
        "headline": "headline",
        "expertise": "expertise",
        "website": "website",
        "twitter": "twitter",
        "linkedin": "linkedin",
    }
    payload = req.dict(exclude_unset=True)
    for key, attr in field_map.items():
        if key in payload and payload[key] is not None:
            setattr(user, attr, payload[key])

    if req.role is not None and req.role in ("creator", "user"):
        user.role = req.role

    if req.markOnboarded and not user.onboarded_at:
        from datetime import datetime as _dt
        user.onboarded_at = _dt.utcnow()

    db.commit()
    db.refresh(user)
    return user_to_dict(user)
