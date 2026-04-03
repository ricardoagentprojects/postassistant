"""
Database configuration for PostAssistant
Supports SQLite (development) and PostgreSQL (production)
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# If no DATABASE_URL, use SQLite for development
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./postassistant.db"
    print("⚠️  Using SQLite for development. Set DATABASE_URL for PostgreSQL.")

# Handle PostgreSQL URL format for SQLAlchemy
if DATABASE_URL.startswith("postgresql://"):
    # SQLAlchemy expects this format
    pass
elif DATABASE_URL.startswith("postgres://"):
    # Render provides postgres://, convert to postgresql://
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import Base from models
from schemas.models import Base

# Create tables function
def create_tables():
    Base.metadata.create_all(bind=engine)