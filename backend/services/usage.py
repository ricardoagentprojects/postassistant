"""Per-user generation quotas (calendar month, UTC)."""

import os
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from schemas.models import Content, User


def _month_start_utc() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def count_generations_this_utc_month(db: Session, user_id: int) -> int:
    start = _month_start_utc()
    return (
        db.query(func.count(Content.id))
        .filter(
            Content.user_id == user_id,
            Content.created_at >= start,
            Content.status != "deleted",
        )
        .scalar()
        or 0
    )


def effective_monthly_generation_cap(user: User) -> int:
    """Max AI generations (new Content rows) per UTC month."""
    st = (user.subscription_status or "").lower()
    if st not in ("active", "trialing"):
        return 0
    tier = (user.subscription_tier or "free").lower()
    if tier == "free":
        return max(1, int(os.getenv("FREE_TIER_MONTHLY_GENERATIONS", str(user.monthly_post_limit or 25))))
    if tier in ("pro", "starter", "business"):
        env = os.getenv("PRO_TIER_MONTHLY_GENERATIONS")
        if env and env.isdigit():
            return max(1, int(env))
        return max(1, user.monthly_post_limit or 500)
    return max(1, user.monthly_post_limit or 100)


def assert_can_generate(db: Session, user: User) -> None:
    used = count_generations_this_utc_month(db, user.id)
    cap = effective_monthly_generation_cap(user)
    if used >= cap:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Monthly generation limit reached ({used}/{cap} this UTC month). "
                "Upgrade your plan or wait until next month."
            ),
        )
