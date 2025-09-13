#!/usr/bin/env python3
"""
Ultra-minimal Railway deployment for Team Rocket Backend
This version prioritizes successful deployment over full functionality
"""

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Team Rocket Backend API",
    description="AI-powered marketing campaign optimization platform - Railway Deployment",
    version="1.0.0-railway"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": "railway-minimal",
        "services": {
            "api": True,
            "storage": False,
            "ml_models": False
        }
    }

@app.get("/")
async def root():
    return {
        "message": "Team Rocket Backend API - Railway Minimal Deployment",
        "docs": "/docs",
        "health": "/health",
        "status": "operational"
    }

# Basic API endpoints for testing
@app.get("/api/campaigns")
async def get_campaigns():
    return {
        "campaigns": [],
        "message": "Campaigns API working - Railway deployment",
        "environment": "minimal"
    }

@app.post("/api/campaigns")
async def create_campaign(campaign_data: dict):
    return {
        "id": "railway_test_campaign",
        "message": "Campaign created successfully (minimal mode)",
        "data": campaign_data
    }

@app.get("/api/creative")
async def get_creative():
    return {
        "message": "Creative API working - Railway deployment",
        "environment": "minimal"
    }

@app.post("/api/creative-score")
async def score_creative(creative_data: dict):
    return {
        "success": True,
        "score": {
            "overall": 75,
            "title": 80,
            "description": 70,
            "cta": 75
        },
        "message": "Creative scored successfully (fallback mode)",
        "environment": "railway-minimal"
    }

@app.get("/api/ml/health")
async def ml_health():
    return {
        "status": "operational",
        "mode": "fallback",
        "message": "ML service running in fallback mode for Railway"
    }

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "environment": "railway-minimal"
        }
    )

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))

    logger.info(f"🚀 Starting Team Rocket Backend (Railway Minimal) on port {port}")

    uvicorn.run(
        "main-minimal:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )