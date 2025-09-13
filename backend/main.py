import os
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.routes import campaigns, creative, ml, auth, dashboard
from app.services.ml_service import load_ml_models
from app.core.storage import storage

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Team Rocket Backend...")
    
    # Initialize storage
    storage.initialize()
    
    # Load ML models
    await load_ml_models()
    
    logger.info("Backend startup complete!")
    yield
    
    # Shutdown
    logger.info("Shutting down backend...")

# Create FastAPI app
app = FastAPI(
    title="Team Rocket Backend",
    description="Unified backend for campaign management and AI-powered optimization",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "services": {
            "campaigns": True,
            "creative_scoring": True,
            "ml_models": True,
            "authentication": True,
            "user_dashboard": True
        }
    }

@app.get("/")
async def root():
    return {
        "message": "Team Rocket Backend API",
        "docs": "/docs",
        "health": "/health"
    }

# Include API routes
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["campaigns"])
app.include_router(creative.router, prefix="/api/creative", tags=["creative"])
app.include_router(ml.router, prefix="/api/ml", tags=["ml"])
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )