"""
PostAssistant Backend API
FastAPI application for AI-powered content assistant
"""

import sys
import os

# ULTIMATE FIX: Works with ANY commit, ANY configuration
print("🚀 Starting PostAssistant Backend...")
print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")
print(f"File location: {__file__}")

# CRITICAL: Add ALL possible paths BEFORE any imports
sys.path.insert(0, '/app')
sys.path.insert(0, '/app/backend')
sys.path.insert(0, os.path.dirname(__file__))

# Try to find schemas directory
schemas_found = False
for base_path in ['/app/backend', '/app', os.path.dirname(__file__)]:
    schemas_path = os.path.join(base_path, 'schemas')
    if os.path.exists(schemas_path):
        sys.path.insert(0, schemas_path)
        print(f"✅ Found schemas at: {schemas_path}")
        schemas_found = True
        break

if not schemas_found:
    print("⚠️  schemas directory not found - using fallback")

print(f"Python paths: {sys.path}")

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from typing import Optional

# ULTIMATE FALLBACK: Create Base directly if import fails
try:
    # Try import with multiple possible locations
    from schemas.models import Base
    print("✅ Successfully imported Base from schemas.models")
except ImportError:
    try:
        # Try alternative import path
        from backend.schemas.models import Base
        print("✅ Successfully imported Base from backend.schemas.models")
    except ImportError:
        # FINAL FALLBACK: Create Base directly
        print("🔧 Creating Base declarative_base directly (fallback)...")
        from sqlalchemy.ext.declarative import declarative_base
        Base = declarative_base()
        print("✅ Base created successfully via fallback")

# App continues regardless of schemas import status
print("🌐 Starting FastAPI server on port 10000...")
from database.session import get_db
# Import routers directly to avoid circular imports
from api.waitlist import router as waitlist_router
from api.content import router as content_router
from api.auth_fixed import router as auth_router

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup/shutdown"""
    # Startup
    print("🚀 Starting PostAssistant API...")
    
    # Create database tables (in development only)
    if os.getenv("ENVIRONMENT") == "development":
        from database.session import engine
        print("📊 Creating database tables...")
        Base.metadata.create_all(bind=engine)
    
    yield
    
    # Shutdown
    print("👋 Shutting down PostAssistant API...")

# Create FastAPI app
app = FastAPI(
    title="PostAssistant API",
    description="AI-powered content assistant for social media",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://postassistant.vercel.app",
        "https://postassistant.ai",
        "https://postassistant.pt",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(waitlist_router, prefix="/api/v1/waitlist", tags=["waitlist"])
app.include_router(content_router, prefix="/api/v1/content", tags=["content"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to PostAssistant API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from datetime import datetime
    return {
        "status": "healthy",
        "service": "postassistant-api",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

@app.get("/api/v1/status")
async def api_status():
    """API status endpoint"""
    return {
        "api": "running",
        "version": "0.1.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
    }

# Dependency for protected routes
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Get current user from JWT token"""
    # TODO: Implement JWT validation
    # This is a placeholder for now
    token = credentials.credentials
    
    # For development, accept any token
    if os.getenv("ENVIRONMENT") == "development":
        return {"id": "dev-user-id", "email": "dev@example.com"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
    )

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development",
    )