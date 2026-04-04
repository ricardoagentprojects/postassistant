"""SQLAlchemy models — single source of truth for persistence."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database.session import Base


def _utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    role = Column(String(100), nullable=True)
    subscription_tier = Column(String(50), nullable=False, default="free")
    subscription_status = Column(String(50), nullable=False, default="active")
    monthly_post_limit = Column(Integer, nullable=False, default=10)
    used_posts_this_month = Column(Integer, nullable=False, default=0)
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    stripe_subscription_id = Column(String(255), nullable=True, index=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    contents = relationship("Content", back_populates="user")


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    platform = Column(String(50), nullable=False)
    content_type = Column(String(50), nullable=False)
    body = Column(Text, nullable=False)
    prompt = Column(Text, nullable=True)
    model = Column(String(100), nullable=True)
    temperature = Column(Float, nullable=False, default=0.7)
    status = Column(String(32), nullable=False, default="draft")
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)
    scheduled_for = Column(DateTime(timezone=True), nullable=True)
    schedule_timezone = Column(String(64), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    engagement_score = Column(Float, nullable=True)
    notification_sent = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="contents")


class Waitlist(Base):
    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    business_type = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)
    notified = Column(Boolean, nullable=False, default=False)
