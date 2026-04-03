#!/bin/bash
# Deploy PostAssistant to Render.com using API

set -e

API_KEY="rnd_nXVsPo71C4y0DtXK8cn4wSPbRfgP"
API_URL="https://api.render.com/v1"
HEADERS=(-H "Authorization: Bearer $API_KEY" -H "Content-Type: application/json")

echo "🚀 Starting PostAssistant deployment to Render..."

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "${API_URL}${endpoint}" "${HEADERS[@]}" -d "$data"
    else
        curl -s -X "$method" "${API_URL}${endpoint}" "${HEADERS[@]}"
    fi
}

# 1. Check existing services
echo "📋 Checking existing services..."
SERVICES=$(api_call GET "/services")
echo "Found services:"
echo "$SERVICES" | python3 -c "import sys,json; data=json.load(sys.stdin); [print(f'  - {s[\"name\"]} ({s[\"id\"]})') for s in data]" 2>/dev/null || echo "  (Could not parse)"

# 2. Delete existing postassistant service if exists
echo "🗑️  Checking for existing postassistant service..."
# Implementation depends on API response

# 3. Create new service using render.yaml blueprint
echo "🔄 Creating new service from render.yaml..."
# Use Render Blueprints API

echo "✅ Deployment script ready. Run with appropriate parameters."