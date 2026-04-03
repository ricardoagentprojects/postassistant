#!/bin/bash
# Render build and start script for PostAssistant

echo "🚀 Starting PostAssistant deployment..."

# Navigate to backend directory
cd backend

# Install Python dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run database migrations (if needed)
# echo "🗄️ Running database migrations..."
# alembic upgrade head

# Start the FastAPI application
echo "🌐 Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port $PORT