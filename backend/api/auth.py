# Authentication API endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext

from database.session import get_db
from schemas.models import User

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = "dev-secret-key-change-in-production"  # TODO: Move to env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Pydantic models
class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: uuid.UUID
    email: str

class UserProfileResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    subscription_tier: str
    monthly_post_limit: int
    used_posts_this_month: int
    created_at: datetime

# Utility functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current user from JWT token
    """
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

# API endpoints
@router.post("/signup", response_model=TokenResponse)
async def signup(
    request: UserSignupRequest,
    db: Session = Depends(get_db)
):
    """
    Create new user account
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(request.password)
    
    user = User(
        email=request.email,
        hashed_password=hashed_password,
        full_name=request.full_name,
        subscription_tier="free",
        subscription_status="active",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id,
        email=user.email
    )

@router.post("/login", response_model=TokenResponse)
async def login(
    request: UserLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login user and return JWT token
    """
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id,
        email=user.email
    )

@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user profile
    """
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        subscription_tier=current_user.subscription_tier,
        monthly_post_limit=current_user.monthly_post_limit,
        used_posts_this_month=current_user.used_posts_this_month,
        created_at=current_user.created_at
    )

@router.post("/refresh")
async def refresh_token(
    current_user: User = Depends(get_current_user)
):
    """
    Refresh JWT token
    """
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(current_user.id)},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=current_user.id,
        email=current_user.email
    )

@router.post("/logout")
async def logout():
    """
    Logout user (client-side token invalidation)
    """
    return {"message": "Successfully logged out"}

@router.post("/password/reset-request")
async def request_password_reset(
    email: EmailStr,
    db: Session = Depends(get_db)
):
    """
    Request password reset (mock for now)
    """
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # In production, send email with reset link
        # For now, just return success message
        return {
            "message": "If an account exists with this email, a reset link has been sent",
            "email_sent": True
        }
    
    # Still return success to prevent email enumeration
    return {
        "message": "If an account exists with this email, a reset link has been sent",
        "email_sent": True
    }

@router.post("/password/reset")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """
    Reset password with token (mock for now)
    """
    # In production, validate token and update password
    # For now, return success message
    return {
        "message": "Password reset successfully",
        "success": True
    }

# Development-only endpoints
@router.post("/dev/create-test-user")
async def create_test_user(db: Session = Depends(get_db)):
    """
    Create a test user for development (remove in production)
    """
    test_email = "test@postassistant.com"
    
    existing = db.query(User).filter(User.email == test_email).first()
    if existing:
        return {
            "message": "Test user already exists",
            "user_id": str(existing.id),
            "email": existing.email
        }
    
    user = User(
        email=test_email,
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
        subscription_tier="pro",
        subscription_status="active",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create token for immediate use
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "message": "Test user created",
        "user_id": str(user.id),
        "email": user.email,
        "access_token": access_token,
        "password": "testpassword123"  # Only for development!
    }