#!/bin/bash
# Debug Render service via SSH

SSH_KEY="$HOME/.ssh/id_ed25519_render"
SSH_HOST="srv-d77aicfkijhs73ad9d7g@ssh.frankfurt.render.com"

echo "🔍 Debugging Render service: $SSH_HOST"

# Test SSH connection
echo "Testing SSH connection..."
ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_HOST" << 'EOF'
echo "✅ Connected to Render service"
echo "=== System Info ==="
uname -a
echo "=== Python Info ==="
python3 --version
which python3
echo "=== PYTHONPATH ==="
echo $PYTHONPATH
echo "=== Directory Structure ==="
pwd
ls -la
echo "=== Backend Directory ==="
cd /app/backend 2>/dev/null && pwd && ls -la || echo "No /app/backend directory"
echo "=== Check schemas module ==="
python3 -c "import sys; sys.path.insert(0, '/app'); import schemas; print('✅ schemas module found')" 2>&1 || echo "❌ schemas module error"
echo "=== Check main.py imports ==="
cd /app/backend 2>/dev/null && python3 -c "import main; print('✅ main.py imports work')" 2>&1 || echo "❌ main.py import error"
EOF

echo "✅ Debug script ready. Run after SSH key is added to Render."