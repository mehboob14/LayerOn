"""Stripe client + customer helpers."""
from __future__ import annotations

from typing import Any, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..config import STRIPE_SECRET_KEY
from ..models import User


CREDIT_PACKAGES = [
    {"key": "starter", "name": "Starter Pack", "credits": 50, "price_cents": 499, "description": "50 credits"},
    {"key": "pro", "name": "Pro Pack", "credits": 200, "price_cents": 1499, "description": "200 credits", "popular": True},
    {"key": "power", "name": "Power Pack", "credits": 500, "price_cents": 2999, "description": "500 credits"},
]


def get_stripe_client() -> Optional[Any]:
    if not STRIPE_SECRET_KEY:
        return None
    try:
        import stripe as stripe_lib
    except ImportError:
        print("[stripe] 'stripe' package not installed; billing endpoints disabled.")
        return None
    stripe_lib.api_key = STRIPE_SECRET_KEY
    return stripe_lib


def get_or_create_stripe_customer(user: User, db: Session) -> str:
    if user.stripe_customer_id:
        return user.stripe_customer_id

    s = get_stripe_client()
    if not s:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    full_name = f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email
    customer = s.Customer.create(
        email=user.email,
        name=full_name,
        metadata={"layeron_user_id": user.id},
    )
    user.stripe_customer_id = customer.id
    db.commit()
    return customer.id


def find_package(key: str) -> Optional[dict]:
    return next((p for p in CREDIT_PACKAGES if p["key"] == key), None)
