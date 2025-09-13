#!/bin/bash
set -e

echo "🚀 Starting Team Rocket Backend on Railway..."

# Create models directory
mkdir -p /app/models

# Railway doesn't support volume mounts, so we'll start without external models
# The app should handle missing models gracefully with mock responses
echo "📁 Models directory created at /app/models"
echo "ℹ️  Running in Railway mode - using fallback/mock responses for ML models"

# Set Railway environment variables
export RAILWAY_ENVIRONMENT=${RAILWAY_ENVIRONMENT:-production}
export PORT=${PORT:-8000}

echo "🌐 Environment: $RAILWAY_ENVIRONMENT"
echo "🔌 Port: $PORT"

# Start the FastAPI server
echo "🔄 Starting FastAPI server on port $PORT..."
exec python main.py