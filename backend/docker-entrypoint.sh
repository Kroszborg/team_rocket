#!/bin/bash
set -e

echo "🚀 Starting Team Rocket Backend in Docker..."

# Copy model files from mounted source
echo "📁 Copying model files..."
if [ -f "/app/models-source/CAMPAIGNMODEL.pkl" ]; then
    cp "/app/models-source/CAMPAIGNMODEL.pkl" "/app/models/campaign_optimizer_usd.pkl"
    echo "✅ Copied CAMPAIGNMODEL.pkl -> campaign_optimizer_usd.pkl"
else
    echo "⚠️  CAMPAIGNMODEL.pkl not found in models-source"
fi

if [ -f "/app/models-source/model_feature_columns_usd.json" ]; then
    cp "/app/models-source/model_feature_columns_usd.json" "/app/models/"
    echo "✅ Copied model_feature_columns_usd.json"
else
    echo "⚠️  model_feature_columns_usd.json not found in models-source"
fi

echo "🔄 Starting FastAPI server..."
exec python main.py