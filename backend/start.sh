#!/bin/bash
cd /app
export PYTHONPATH=/app:/app/backend:$PYTHONPATH
echo "🚀 Starting PostAssistant Backend..."
echo "Python version: $(python3 --version)"
echo "Current directory: $(pwd)"
echo "PYTHONPATH: $PYTHONPATH"
echo "PORT environment variable: $PORT"
python3 -c "import sys; print('Paths:', sys.path)"
uvicorn main:app --host 0.0.0.0 --port $PORT