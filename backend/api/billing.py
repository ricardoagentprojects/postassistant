"""
Stripe Checkout + webhooks. Safe no-op when STRIPE_SECRET_KEY is unset (503 on checkout).
"""

import logging
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from api.auth import get_current_user
from database.session import get_db
from schemas.models import User

logger = logging.getLogger(__name__)
router = APIRouter()

try:
    import stripe

    _stripe_key = (os.getenv("STRIPE_SECRET_KEY") or "").strip()
    if _stripe_key:
        stripe.api_key = _stripe_key
    SignatureVerificationError = getattr(
        stripe, "SignatureVerificationError", Exception
    )
except ImportError:
    stripe = None  # type: ignore
    SignatureVerificationError = Exception  # type: ignore


def _stripe_ready() -> bool:
    return stripe is not None and bool((os.getenv("STRIPE_SECRET_KEY") or "").strip())


@router.post("/create-checkout-session")
def create_checkout_session(
    current_user: User = Depends(get_current_user),
):
    if not _stripe_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Online billing is not configured. Join the waitlist or contact sales.",
        )

    price_id = (os.getenv("STRIPE_PRICE_ID_PRO") or "").strip()
    if not price_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe price ID missing (STRIPE_PRICE_ID_PRO).",
        )

    frontend = (os.getenv("FRONTEND_URL") or "http://localhost:3000").rstrip("/")

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{frontend}/dashboard?tab=overview&billing=success",
            cancel_url=f"{frontend}/dashboard?tab=overview&billing=cancel",
            client_reference_id=str(current_user.id),
            customer_email=current_user.email,
            metadata={"user_id": str(current_user.id)},
            subscription_data={
                "metadata": {"user_id": str(current_user.id)},
            },
        )
    except Exception as e:
        logger.exception("Stripe checkout failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not start checkout. Try again later.",
        ) from e

    return {"url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    if not _stripe_ready():
        raise HTTPException(status_code=404, detail="Not found")

    payload = await request.body()
    sig = request.headers.get("stripe-signature") or ""
    wh_secret = (os.getenv("STRIPE_WEBHOOK_SECRET") or "").strip()
    if not wh_secret:
        logger.warning("STRIPE_WEBHOOK_SECRET missing; refusing webhook")
        raise HTTPException(status_code=503, detail="Webhook not configured")

    try:
        event = stripe.Webhook.construct_event(payload, sig, wh_secret)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload") from e
    except SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature") from e

    etype = event["type"]
    data = event.get("data", {}).get("object", {})

    def _uid(meta: dict) -> Optional[int]:
        raw = (meta or {}).get("user_id")
        if raw is None:
            return None
        try:
            return int(raw)
        except (TypeError, ValueError):
            return None

    if etype == "checkout.session.completed":
        meta = data.get("metadata") or {}
        uid = _uid(meta) or (int(data["client_reference_id"]) if data.get("client_reference_id") else None)
        if uid:
            user = db.query(User).filter(User.id == uid).first()
            if user:
                user.stripe_customer_id = data.get("customer") or user.stripe_customer_id
                sub_id = data.get("subscription")
                if sub_id:
                    user.stripe_subscription_id = sub_id
                user.subscription_tier = "pro"
                user.subscription_status = "active"
                user.monthly_post_limit = max(user.monthly_post_limit, 500)
                db.commit()
                logger.info("Activated Pro for user_id=%s from checkout", uid)

    elif etype in ("customer.subscription.deleted", "customer.subscription.canceled"):
        sub_id = data.get("id")
        if sub_id:
            user = db.query(User).filter(User.stripe_subscription_id == sub_id).first()
            if user:
                user.subscription_status = "canceled"
                user.subscription_tier = "free"
                user.monthly_post_limit = int(os.getenv("FREE_TIER_MONTHLY_GENERATIONS", "25"))
                user.stripe_subscription_id = None
                db.commit()
                logger.info("Downgraded user_id=%s after subscription end", user.id)

    elif etype == "customer.subscription.updated":
        sub_id = data.get("id")
        st = (data.get("status") or "").lower()
        user = db.query(User).filter(User.stripe_subscription_id == sub_id).first()
        if user:
            user.subscription_status = st or user.subscription_status
            if st in ("active", "trialing"):
                user.subscription_tier = "pro"
            db.commit()

    return {"received": True, "type": etype}
