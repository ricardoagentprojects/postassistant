"""
Fixed auth endpoints for frontend compatibility
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from jose import jwt
import os

router = APIRouter()

# Mock user database (replace with real DB later)
MOCK_USERS = [
    {
        "id": 1,
        "email": "demo@example.com",
        "password": "demo123",  # In real app, use hashed passwords
        "name": "Demo User",
        "company": "Demo Company",
        "role": "Owner",
        "plan": "free",
        "created_at": "2026-04-03T00:00:00Z"
    }
]

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET", "development-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    company: Optional[str] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    company: Optional[str]
    role: Optional[str]
    plan: str
    created_at: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Mock login endpoint - always returns success for development
    """
    # In production, validate credentials against database
    # For now, always return mock user
    
    # Create mock user based on email
    user_data = {
        "id": 2,
        "email": request.email,
        "name": request.email.split("@")[0].title(),
        "company": "My Company",
        "role": "Owner",
        "plan": "free",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": request.email, "user_id": user_data["id"]},
        expires_delta=access_token_expires
    )
    
    return AuthResponse(
        access_token=access_token,
        user=UserResponse(**user_data)
    )

@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    Mock register endpoint - always returns success for development
    """
    # In production, create user in database
    # For now, always return success
    
    user_data = {
        "id": 3,
        "email": request.email,
        "name": request.name,
        "company": request.company or "My Company",
        "role": request.role or "Owner",
        "plan": "free",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": request.email, "user_id": user_data["id"]},
        expires_delta=access_token_expires
    )
    
    return AuthResponse(
        access_token=access_token,
        user=UserResponse(**user_data)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(lambda: "mock-token")):
    """
    Get current user info (mock)
    """
    # In production, validate JWT token
    # For now, return mock user
    
    return UserResponse(
        id=1,
        email="demo@example.com",
        name="Demo User",
        company="Demo Company",
        role="Owner",
        plan="free",
        created_at="2026-04-03T00:00:00Z"
    )