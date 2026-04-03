# Waitlist API endpoints
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from database import get_db
from schemas.models import Waitlist

router = APIRouter()

# Pydantic models
class WaitlistRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    business_type: Optional[str] = None

class WaitlistResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    business_type: Optional[str]
    created_at: datetime
    notified: bool

@router.post("/join", response_model=WaitlistResponse)
async def join_waitlist(
    request: WaitlistRequest,
    db: Session = Depends(get_db)
):
    """
    Join the waitlist
    """
    # Check if already in waitlist
    existing = db.query(Waitlist).filter(Waitlist.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in waitlist"
        )
    
    # Create new entry
    waitlist_entry = Waitlist(
        email=request.email,
        name=request.name,
        business_type=request.business_type,
        created_at=datetime.now(timezone.utc),
        notified=False
    )
    
    db.add(waitlist_entry)
    db.commit()
    db.refresh(waitlist_entry)
    
    return WaitlistResponse(
        id=waitlist_entry.id,
        email=waitlist_entry.email,
        name=waitlist_entry.name,
        business_type=waitlist_entry.business_type,
        created_at=waitlist_entry.created_at,
        notified=waitlist_entry.notified
    )

@router.get("/count")
async def get_waitlist_count(db: Session = Depends(get_db)):
    """
    Get waitlist count
    """
    count = db.query(Waitlist).count()
    return {
        "count": count,
        "estimated_wait_days": count * 2  # Mock
    }

@router.get("/list")
async def get_waitlist(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get waitlist entries (admin only in production)
    """
    entries = db.query(Waitlist).offset(offset).limit(limit).all()
    total = db.query(Waitlist).count()
    
    return {
        "total": total,
        "entries": [
            {
                "id": e.id,
                "email": e.email,
                "name": e.name,
                "business_type": e.business_type,
                "created_at": e.created_at,
                "notified": e.notified
            }
            for e in entries
        ]
    }