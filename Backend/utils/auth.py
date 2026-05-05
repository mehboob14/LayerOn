"""Clerk JWT verification + FastAPI auth dependencies."""
from __future__ import annotations

import base64
from typing import Optional

import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..config import CLERK_PUBLISHABLE_KEY
from ..database import get_db
from ..models import User

_jwks_client: Optional[PyJWKClient] = None


def _resolve_jwks_url() -> str:
    if not CLERK_PUBLISHABLE_KEY:
        return ""

    if CLERK_PUBLISHABLE_KEY.startswith("pk_test_"):
        domain = CLERK_PUBLISHABLE_KEY.removeprefix("pk_test_").rstrip("$")
    elif CLERK_PUBLISHABLE_KEY.startswith("pk_live_"):
        domain = CLERK_PUBLISHABLE_KEY.removeprefix("pk_live_").rstrip("$")
    else:
        return ""

    try:
        decoded = base64.b64decode(domain + "==").decode("utf-8").rstrip("$")
        return f"https://{decoded}/.well-known/jwks.json"
    except Exception:
        return f"https://{domain}/.well-known/jwks.json"


def get_jwks_client() -> Optional[PyJWKClient]:
    global _jwks_client
    if _jwks_client is None:
        url = _resolve_jwks_url()
        if url:
            _jwks_client = PyJWKClient(url)
    return _jwks_client


def verify_clerk_token(request: Request) -> Optional[dict]:
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header[7:]
    jwks = get_jwks_client()
    if not jwks:
        return None

    try:
        signing_key = jwks.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
    except Exception as e:
        print(f"[auth] JWT verification failed: {e}")
        return None


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    claims = verify_clerk_token(request)
    if not claims:
        raise HTTPException(status_code=401, detail="Not authenticated")

    clerk_id = claims.get("sub")
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found. Please complete onboarding.")
    return user


def get_optional_user(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[User]:
    try:
        return get_current_user(request, db)
    except HTTPException:
        return None
