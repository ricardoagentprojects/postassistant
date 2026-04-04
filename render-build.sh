#!/bin/bash
# Render.com definitive build script
# Absolute paths for Render environment

echo "🚀 PostAssistant Render Build Script"
echo "Working directory: $(pwd)"
echo "Contents:"
ls -la

# Install dependencies from root
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Navigate to backend
cd backend

# Start FastAPI
echo "🌐 Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port $PORT