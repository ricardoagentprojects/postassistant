# Content generation API endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from datetime import datetime, timezone

from database.session import get_db
from schemas.models import Content, User
# Use fixed version that always works
from services.openai_fixed import generate_content

router = APIRouter()

# Pydantic models
class ContentGenerationRequest(BaseModel):
    platform: str = Field(..., description="twitter, instagram, linkedin")
    content_type: str = Field(..., description="post, thread, story, reel")
    topic: str = Field(..., description="Topic or theme for content")
    tone: Optional[str] = Field("professional", description="casual, professional, funny, inspirational")
    length: Optional[str] = Field("medium", description="short, medium, long")
    hashtags: Optional[List[str]] = Field(default_factory=list)
    emojis: Optional[bool] = Field(True, description="Include emojis")
    
class ContentGenerationResponse(BaseModel):
    id: uuid.UUID
    content: str
    platform: str
    content_type: str
    generated_at: datetime
    model: Optional[str] = None
    token_count: Optional[int] = None

class ContentListResponse(BaseModel):
    id: uuid.UUID
    content: str
    platform: str
    content_type: str
    status: str
    created_at: datetime
    scheduled_for: Optional[datetime] = None
    published_at: Optional[datetime] = None



@router.post("/schedule")
async def schedule_content(
    content_id: uuid.UUID,
    schedule_time: datetime,
    db: Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user)  # TODO: Add auth
):
    """
    Schedule content for posting
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Update content status
    content.status = "scheduled"
    content.scheduled_for = schedule_time
    content.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "message": "Content scheduled successfully",
        "content_id": str(content_id),
        "scheduled_for": schedule_time.isoformat(),
        "status": "scheduled"
    }

@router.post("/generate", response_model=ContentGenerationResponse)
async def generate_content_endpoint(
    request: ContentGenerationRequest,
    db: Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user)  # TODO: Add auth
):
    """
    Generate AI-powered content for social media
    """
    # For now, use a mock user (development only)
    user_id = uuid.uuid4()  # TODO: Replace with actual user ID from auth
    
    # Generate content using OpenAI
    try:
        generated = generate_content(
            platform=request.platform,
            content_type=request.content_type,
            topic=request.topic,
            tone=request.tone,
            length=request.length,
            hashtags=request.hashtags,
            include_emojis=request.emojis
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content generation failed: {str(e)}"
        )
    
    # Save to database
    content_entry = Content(
        user_id=user_id,
        platform=request.platform,
        content_type=request.content_type,
        content=generated["content"],
        prompt=request.topic,
        model=generated.get("model"),
        temperature=70,
        status="draft",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    db.add(content_entry)
    db.commit()
    db.refresh(content_entry)
    
    return ContentGenerationResponse(
        id=content_entry.id,
        content=content_entry.content,
        platform=content_entry.platform,
        content_type=content_entry.content_type,
        generated_at=content_entry.created_at,
        model=content_entry.model,
        token_count=generated.get("token_count")
    )

@router.get("/list", response_model=List[ContentListResponse])
async def list_user_content(
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user)  # TODO: Add auth
):
    """
    List user's generated content
    """
    # For now, return all content (development)
    query = db.query(Content)
    
    if status_filter:
        query = query.filter(Content.status == status_filter)
    
    contents = query.order_by(Content.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        ContentListResponse(
            id=content.id,
            content=content.content[:100] + "..." if len(content.content) > 100 else content.content,
            platform=content.platform,
            content_type=content.content_type,
            status=content.status,
            created_at=content.created_at,
            scheduled_for=content.scheduled_for,
            published_at=content.published_at
        )
        for content in contents
    ]

@router.get("/{content_id}")
async def get_content(
    content_id: uuid.UUID,
    db: Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user)  # TODO: Add auth
):
    """
    Get specific content by ID
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    return {
        "id": content.id,
        "content": content.content,
        "platform": content.platform,
        "content_type": content.content_type,
        "status": content.status,
        "created_at": content.created_at.isoformat() if content.created_at else None,
        "scheduled_for": content.scheduled_for.isoformat() if content.scheduled_for else None,
        "published_at": content.published_at.isoformat() if content.published_at else None,
        "engagement_score": content.engagement_score,
        "model": content.model,
        "prompt": content.prompt
    }

@router.post("/{content_id}/publish")
async def publish_content(
    content_id: uuid.UUID,
    db: Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user)  # TODO: Add auth
):
    """
    Mark content as published (simulated - actual publishing comes later)
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.status = "published"
    content.published_at = datetime.now(timezone.utc)
    content.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "message": "Content published successfully",
        "content_id": str(content_id),
        "published_at": content.published_at.isoformat(),
        "status": "published"
    }

@router.delete("/{content_id}")
async def delete_content(
    content_id: uuid.UUID,
    db: Session = Depends(get_db),
    # current_user: dict = Depends(get_current_user)  # TODO: Add auth
):
    """
    Delete content (soft delete - update status)
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.status = "deleted"
    content.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "message": "Content deleted successfully",
        "content_id": str(content_id),
        "status": "deleted"
    }