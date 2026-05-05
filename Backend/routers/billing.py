"""Stripe checkout + credit top-up."""
from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..config import STRIPE_WEBHOOK_SECRET
from ..database import get_db
from ..models import User
from ..schemas import CheckoutRequest
from ..utils.auth import get_current_user
from ..utils.stripe_client import (
    CREDIT_PACKAGES,
    find_package,
    get_or_create_stripe_customer,
    get_stripe_client,
)

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.get("/credits")
def get_credits(user: User = Depends(get_current_user)):
    return {"credits": user.credits, "packages": CREDIT_PACKAGES}


@router.get("/packages")
def get_packages():
    return {"packages": CREDIT_PACKAGES}


@router.post("/checkout")
def create_checkout(
    req: CheckoutRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s = get_stripe_client()
    if not s:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    pkg = find_package(req.packageKey)
    if not pkg:
        raise HTTPException(status_code=400, detail="Invalid package")

    customer_id = get_or_create_stripe_customer(user, db)

    host = request.headers.get("host", "localhost:5173")
    scheme = "https" if "replit" in host else request.url.scheme
    base_url = f"{scheme}://{host}"

    session = s.checkout.Session.create(
        customer=customer_id,
        mode="payment",
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": pkg["name"],
                    "description": f"{pkg['credits']} credits for LayerOn",
                },
                "unit_amount": pkg["price_cents"],
            },
            "quantity": 1,
        }],
        metadata={
            "user_id": user.id,
            "package_key": req.packageKey,
            "credits": str(pkg["credits"]),
        },
        success_url=f"{base_url}/billing?status=success",
        cancel_url=f"{base_url}/billing?status=cancelled",
    )

    return {"url": session.url, "sessionId": session.id}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    s = get_stripe_client()
    if not s:
        return {"error": "Stripe not configured"}

    try:
        if STRIPE_WEBHOOK_SECRET:
            event = s.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
        else:
            event = json.loads(payload)
    except Exception as e:
        print(f"[stripe] Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook")

    if event.get("type") == "checkout.session.completed":
        metadata = event["data"]["object"].get("metadata", {})
        user_id = metadata.get("user_id")
        credits_to_add = int(metadata.get("credits", "0"))

        if user_id and credits_to_add > 0:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.credits = (user.credits or 0) + credits_to_add
                db.commit()
                print(f"[stripe] Added {credits_to_add} credits to user {user_id}")

    return {"received": True}


@router.post("/verify-session")
async def verify_session(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    body = await request.json()
    session_id = body.get("sessionId", "")

    s = get_stripe_client()
    if not s or not session_id:
        raise HTTPException(status_code=400, detail="Invalid request")

    try:
        session = s.checkout.Session.retrieve(session_id)
        if session.payment_status == "paid":
            metadata = session.get("metadata", {})
            credits_to_add = int(metadata.get("credits", "0"))
            if credits_to_add > 0 and metadata.get("user_id") == user.id:
                user.credits = (user.credits or 0) + credits_to_add
                db.commit()
                return {"success": True, "credits": user.credits, "added": credits_to_add}
        return {"success": False, "status": session.payment_status}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
