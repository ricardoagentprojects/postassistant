# Content generation, scheduling, and calendar API (JWT-scoped per user)
import csv
from datetime import date, datetime, time, timedelta, timezone
from io import StringIO
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import and_
from sqlalchemy.orm import Session

from api.auth import get_current_user
from database.session import get_db
from schemas.models import Content, User
from services.ai_rate_limit import assert_under_rate_limit
from services.openai import generate_content, generate_content_variations, refine_content
from services.usage import (
    assert_can_generate,
    count_generations_this_utc_month,
    effective_monthly_generation_cap,
)

router = APIRouter()


def _scope(db: Session, user_id: int):
    return db.query(Content).filter(Content.user_id == user_id, Content.status != "deleted")


def _owned(db: Session, user_id: int, content_id: int) -> Optional[Content]:
    return _scope(db, user_id).filter(Content.id == content_id).first()


class ContentGenerationRequest(BaseModel):
    platform: str = Field(..., description="twitter, instagram, linkedin")
    content_type: str = Field(..., description="post, thread, story, reel")
    topic: str = Field(..., description="Topic or theme for content")
    tone: Optional[str] = Field("professional", description="casual, professional, funny, inspirational")
    length: Optional[str] = Field("medium", description="short, medium, long")
    hashtags: Optional[List[str]] = Field(default_factory=list)
    emojis: Optional[bool] = Field(True, description="Include emojis")


class ContentGenerationResponse(BaseModel):
    id: int
    content: str
    platform: str
    content_type: str
    generated_at: datetime
    model: Optional[str] = None
    token_count: Optional[int] = None


class ContentListResponse(BaseModel):
    id: int
    content: str
    platform: str
    content_type: str
    status: str
    created_at: datetime
    scheduled_for: Optional[datetime] = None
    published_at: Optional[datetime] = None
    prompt: Optional[str] = None


class ContentStatsResponse(BaseModel):
    total_posts: int
    drafts: int
    scheduled: int
    published: int
    generated_this_week: int
    generations_used_this_month: int
    generations_limit: int


class CalendarItemResponse(BaseModel):
    id: int
    preview: str
    platform: str
    content_type: str
    status: str
    scheduled_for: datetime
    schedule_timezone: Optional[str] = None


class ScheduleRequest(BaseModel):
    content_id: int
    schedule_time: datetime
    timezone: str = Field("UTC", description="IANA timezone e.g. Europe/Lisbon")


class RescheduleRequest(BaseModel):
    schedule_time: datetime
    timezone: Optional[str] = None


class VariationsRequest(BaseModel):
    base_content: str
    platform: str = "instagram"
    num_variations: int = Field(3, ge=1, le=5)


class VariationItem(BaseModel):
    content: str
    tone: Optional[str] = None
    hashtags: List[str] = Field(default_factory=list)


class VariationsResponse(BaseModel):
    variations: List[VariationItem]


class RefineRequest(BaseModel):
    instruction: str = Field(..., min_length=3)
    text: Optional[str] = None
    content_id: Optional[int] = None
    platform: str = "instagram"

    @model_validator(mode="after")
    def need_source(self):
        if not self.text and self.content_id is None:
            raise ValueError("Provide text or content_id")
        return self


class RefineResponse(BaseModel):
    content: str
    model: Optional[str] = None


@router.get("/stats", response_model=ContentStatsResponse)
async def content_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base = _scope(db, current_user.id)
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    total_posts = base.count()
    drafts = base.filter(Content.status == "draft").count()
    scheduled = base.filter(Content.status == "scheduled").count()
    published = base.filter(Content.status == "published").count()
    generated_this_week = base.filter(Content.created_at >= week_ago).count()
    used = count_generations_this_utc_month(db, current_user.id)
    cap = effective_monthly_generation_cap(current_user)

    return ContentStatsResponse(
        total_posts=total_posts,
        drafts=drafts,
        scheduled=scheduled,
        published=published,
        generated_this_week=generated_this_week,
        generations_used_this_month=used,
        generations_limit=cap,
    )


@router.get("/calendar", response_model=List[CalendarItemResponse])
async def calendar_range(
    from_date: date,
    to_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if to_date < from_date:
        raise HTTPException(status_code=400, detail="to_date must be on or after from_date")

    start = datetime.combine(from_date, time.min, tzinfo=timezone.utc)
    end = datetime.combine(to_date, time.max, tzinfo=timezone.utc)

    rows = (
        _scope(db, current_user.id)
        .filter(
            and_(
                Content.scheduled_for.isnot(None),
                Content.scheduled_for >= start,
                Content.scheduled_for <= end,
                Content.status == "scheduled",
            )
        )
        .order_by(Content.scheduled_for.asc())
        .all()
    )

    return [
        CalendarItemResponse(
            id=c.id,
            preview=(c.body[:120] + "…") if len(c.body) > 120 else c.body,
            platform=c.platform,
            content_type=c.content_type,
            status=c.status,
            scheduled_for=c.scheduled_for,
            schedule_timezone=c.schedule_timezone,
        )
        for c in rows
    ]


@router.get("/export/csv")
async def export_content_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        _scope(db, current_user.id)
        .order_by(Content.created_at.desc())
        .all()
    )
    buf = StringIO()
    w = csv.writer(buf)
    w.writerow(
        [
            "id",
            "platform",
            "content_type",
            "status",
            "created_at",
            "scheduled_for",
            "published_at",
            "prompt",
            "body",
        ]
    )
    for c in rows:
        w.writerow(
            [
                c.id,
                c.platform,
                c.content_type,
                c.status,
                c.created_at.isoformat() if c.created_at else "",
                c.scheduled_for.isoformat() if c.scheduled_for else "",
                c.published_at.isoformat() if c.published_at else "",
                (c.prompt or "").replace("\n", " "),
                c.body.replace("\n", "\\n"),
            ]
        )
    buf.seek(0)
    filename = f"postassistant-export-{current_user.id}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/generate", response_model=ContentGenerationResponse)
async def generate_content_endpoint(
    request: ContentGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_under_rate_limit(current_user.id)
    assert_can_generate(db, current_user)

    try:
        generated = await generate_content(
            platform=request.platform,
            content_type=request.content_type,
            topic=request.topic,
            tone=request.tone or "professional",
            length=request.length or "medium",
            hashtags=request.hashtags,
            include_emojis=request.emojis if request.emojis is not None else True,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Content generation failed",
        ) from e

    now = datetime.now(timezone.utc)
    content_entry = Content(
        user_id=current_user.id,
        platform=request.platform,
        content_type=request.content_type,
        body=generated["content"],
        prompt=request.topic,
        model=generated.get("model"),
        temperature=0.7,
        status="draft",
        created_at=now,
        updated_at=now,
    )
    db.add(content_entry)
    db.commit()
    db.refresh(content_entry)

    return ContentGenerationResponse(
        id=content_entry.id,
        content=content_entry.body,
        platform=content_entry.platform,
        content_type=content_entry.content_type,
        generated_at=content_entry.created_at,
        model=content_entry.model,
        token_count=generated.get("total_tokens"),
    )


@router.post("/variations", response_model=VariationsResponse)
async def create_variations(
    request: VariationsRequest,
    current_user: User = Depends(get_current_user),
):
    assert_under_rate_limit(current_user.id)
    try:
        raw = await generate_content_variations(
            request.base_content,
            request.platform,
            request.num_variations,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate variations",
        ) from e

    items = [
        VariationItem(
            content=v.get("content", ""),
            tone=v.get("tone"),
            hashtags=list(v.get("hashtags") or []),
        )
        for v in raw
        if v.get("content")
    ]
    return VariationsResponse(variations=items)


@router.post("/refine", response_model=RefineResponse)
async def refine_copy(
    request: RefineRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_under_rate_limit(current_user.id)
    text = request.text
    if request.content_id is not None:
        row = _owned(db, current_user.id, request.content_id)
        if not row:
            raise HTTPException(status_code=404, detail="Content not found")
        text = row.body

    if not text:
        raise HTTPException(status_code=400, detail="No text to refine")

    try:
        out = await refine_content(text, request.instruction, request.platform)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Refine failed",
        ) from e

    return RefineResponse(content=out["content"], model=out.get("model"))


@router.post("/schedule")
async def schedule_content(
    request: ScheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = _owned(db, current_user.id, request.content_id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    st = request.schedule_time
    if st.tzinfo is None:
        st = st.replace(tzinfo=timezone.utc)

    content.status = "scheduled"
    content.scheduled_for = st
    content.schedule_timezone = request.timezone
    content.updated_at = datetime.now(timezone.utc)
    content.notification_sent = False

    db.commit()

    return {
        "message": "Content scheduled successfully",
        "content_id": request.content_id,
        "scheduled_for": st.isoformat(),
        "timezone": request.timezone,
        "status": "scheduled",
    }


@router.patch("/{content_id}/schedule")
async def reschedule_content(
    content_id: int,
    body: RescheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = _owned(db, current_user.id, content_id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    st = body.schedule_time
    if st.tzinfo is None:
        st = st.replace(tzinfo=timezone.utc)

    content.scheduled_for = st
    content.status = "scheduled"
    if body.timezone:
        content.schedule_timezone = body.timezone
    content.updated_at = datetime.now(timezone.utc)
    content.notification_sent = False

    db.commit()

    return {
        "message": "Rescheduled",
        "content_id": content_id,
        "scheduled_for": st.isoformat(),
    }


@router.get("/list", response_model=List[ContentListResponse])
async def list_user_content(
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
    full: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = _scope(db, current_user.id)

    if status_filter:
        query = query.filter(Content.status == status_filter)

    contents = query.order_by(Content.created_at.desc()).offset(skip).limit(limit).all()

    def body_preview(c: Content) -> str:
        if full:
            return c.body
        return c.body[:100] + "..." if len(c.body) > 100 else c.body

    return [
        ContentListResponse(
            id=c.id,
            content=body_preview(c),
            platform=c.platform,
            content_type=c.content_type,
            status=c.status,
            created_at=c.created_at,
            scheduled_for=c.scheduled_for,
            published_at=c.published_at,
            prompt=c.prompt,
        )
        for c in contents
    ]


@router.get("/{content_id}")
async def get_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = _owned(db, current_user.id, content_id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    return {
        "id": content.id,
        "content": content.body,
        "platform": content.platform,
        "content_type": content.content_type,
        "status": content.status,
        "created_at": content.created_at.isoformat() if content.created_at else None,
        "scheduled_for": content.scheduled_for.isoformat() if content.scheduled_for else None,
        "schedule_timezone": content.schedule_timezone,
        "published_at": content.published_at.isoformat() if content.published_at else None,
        "engagement_score": content.engagement_score,
        "model": content.model,
        "prompt": content.prompt,
    }


@router.post("/{content_id}/publish")
async def publish_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = _owned(db, current_user.id, content_id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    now = datetime.now(timezone.utc)
    content.status = "published"
    content.published_at = now
    content.updated_at = now

    db.commit()

    return {
        "message": (
            "Marked as published in your workspace (manual tracking). "
            "PostAssistant does not post to social networks yet — copy your text and publish on the platform."
        ),
        "content_id": content_id,
        "published_at": content.published_at.isoformat(),
        "status": "published",
    }


@router.delete("/{content_id}")
async def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = _owned(db, current_user.id, content_id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    content.status = "deleted"
    content.updated_at = datetime.now(timezone.utc)

    db.commit()

    return {"message": "Content deleted successfully", "content_id": content_id, "status": "deleted"}
