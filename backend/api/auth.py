"""Authentication API — JWT, passwords via passlib, aligned with frontend session shape."""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy.orm import Session

from database.session import get_db
from schemas.models import User
from services.email import send_password_reset_email
from services.usage import count_generations_this_utc_month, effective_monthly_generation_cap

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("ENVIRONMENT") == "production":
        raise RuntimeError("JWT_SECRET or SECRET_KEY must be set in production")
    SECRET_KEY = "dev-only-change-me"

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))
PASSWORD_RESET_EXPIRE_HOURS = int(os.getenv("PASSWORD_RESET_EXPIRE_HOURS", "1"))


class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)
    company: Optional[str] = None
    role: Optional[str] = None


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    plan: str = "free"
    created_at: datetime


class SessionResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserPublic


class PasswordResetRequestBody(BaseModel):
    email: EmailStr


class PasswordResetConfirmBody(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: Optional[str]
    company: Optional[str]
    role: Optional[str]
    subscription_tier: str
    monthly_post_limit: int
    used_posts_this_month: int
    created_at: datetime


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_password_reset_token(user_id: int, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=PASSWORD_RESET_EXPIRE_HOURS)
    return jwt.encode(
        {
            "sub": str(user_id),
            "email": email,
            "scope": "password_reset",
            "exp": expire,
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_password_reset_token(token: str) -> dict:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    if payload.get("scope") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token",
        )
    return payload


def _user_public(user: User) -> UserPublic:
    return UserPublic(
        id=user.id,
        email=user.email,
        name=user.full_name,
        company=user.company,
        role=user.role,
        plan=user.subscription_tier or "free",
        created_at=user.created_at,
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        user_id = int(sub)
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def _issue_session(user: User) -> SessionResponse:
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return SessionResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_user_public(user),
    )


@router.post("/signup", response_model=SessionResponse)
async def signup(request: UserSignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    now = datetime.now(timezone.utc)
    free_cap = int(os.getenv("FREE_TIER_MONTHLY_GENERATIONS", "25"))
    user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        full_name=request.full_name,
        company=request.company,
        role=request.role,
        subscription_tier="free",
        subscription_status="active",
        monthly_post_limit=free_cap,
        created_at=now,
        updated_at=now,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue_session(user)


@router.post("/register", response_model=SessionResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    signup_payload = UserSignupRequest(
        email=request.email,
        password=request.password,
        full_name=request.name,
        company=request.company,
        role=request.role,
    )
    return await signup(signup_payload, db)


@router.post("/login", response_model=SessionResponse)
async def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    return _issue_session(user)


@router.get("/me", response_model=UserPublic)
async def me(current_user: User = Depends(get_current_user)):
    return _user_public(current_user)


@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    used = count_generations_this_utc_month(db, current_user.id)
    cap = effective_monthly_generation_cap(current_user)
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        company=current_user.company,
        role=current_user.role,
        subscription_tier=current_user.subscription_tier,
        monthly_post_limit=cap,
        used_posts_this_month=used,
        created_at=current_user.created_at,
    )


@router.post("/refresh", response_model=SessionResponse)
async def refresh_token(current_user: User = Depends(get_current_user)):
    return _issue_session(current_user)


@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}


@router.post("/password/reset-request")
async def request_password_reset(
    body: PasswordResetRequestBody,
    db: Session = Depends(get_db),
):
    """
    Always returns the same message (no email enumeration).
    Sends reset email when SMTP is configured and the user exists.
    """
    user = db.query(User).filter(User.email == body.email).first()
    email_sent = False
    dev_reset_link: Optional[str] = None

    if user:
        token = create_password_reset_token(user.id, user.email)
        base = (os.getenv("FRONTEND_URL") or "http://localhost:3000").rstrip("/")
        reset_link = f"{base}/reset-password?token={quote(token, safe='')}"
        email_sent = send_password_reset_email(user.email, reset_link)
        if not email_sent and os.getenv("ENVIRONMENT") == "development":
            dev_reset_link = reset_link

    return {
        "message": "If an account exists for this email, you will receive reset instructions shortly.",
        "email_sent": email_sent,
        **({"dev_reset_link": dev_reset_link} if dev_reset_link else {}),
    }


@router.post("/password/reset")
async def reset_password(body: PasswordResetConfirmBody, db: Session = Depends(get_db)):
    try:
        payload = decode_password_reset_token(body.token)
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link has expired. Request a new one.",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link",
        )

    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset link",
        )

    user.hashed_password = get_password_hash(body.new_password)
    user.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": "Password updated successfully. You can sign in with your new password.", "success": True}


@router.post("/dev/create-test-user")
async def create_test_user(db: Session = Depends(get_db)):
    if os.getenv("ENVIRONMENT") == "production":
        raise HTTPException(status_code=404, detail="Not found")

    test_email = "test@postassistant.com"
    existing = db.query(User).filter(User.email == test_email).first()
    if existing:
        token = create_access_token(data={"sub": str(existing.id)})
        return {
            "message": "Test user already exists",
            "user_id": existing.id,
            "email": existing.email,
            "access_token": token,
        }

    now = datetime.now(timezone.utc)
    user = User(
        email=test_email,
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
        subscription_tier="pro",
        subscription_status="active",
        monthly_post_limit=500,
        created_at=now,
        updated_at=now,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": str(user.id)})
    return {
        "message": "Test user created",
        "user_id": user.id,
        "email": user.email,
        "access_token": token,
        "password": "testpassword123",
    }
