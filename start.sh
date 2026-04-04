#!/bin/bash
# Start script for PostAssistant in Render/Docker

echo "🚀 Starting PostAssistant Backend..."

# Set Python path to include project root AND backend directory
export PYTHONPATH=/app:/app/backend:$PYTHONPATH

echo "PYTHONPATH set to: $PYTHONPATH"

# Navigate to backend directory
cd /app/backend

# Test imports before starting
python3 -c "
import sys
print('Python paths:')
for p in sys.path:
    print(f'  {p}')
"

# Test schemas import
python3 -c "
try:
    import schemas.models
    print('✅ schemas module found')
except ImportError as e:
    print(f'❌ schemas import error: {e}')
    import os
    print(f'Current dir: {os.getcwd()}')
    import os
    if os.path.exists('schemas'):
        print('schemas directory exists')
    else:
        print('schemas directory NOT found')
"

# Run database migrations (optional - uncomment when needed)
# echo "🗄️ Running database migrations..."
# alembic upgrade head

# Start FastAPI server
echo "🌐 Starting FastAPI server on port ${PORT:-10000}..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}