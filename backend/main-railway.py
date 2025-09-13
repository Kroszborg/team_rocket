import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Minimal imports for Railway
from app.core.config import settings
from app.core.storage import storage

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Team Rocket Backend on Railway...")

    # Initialize storage only (skip ML model loading for faster startup)
    storage.initialize()

    logger.info("Railway backend startup complete!")
    yield

    # Shutdown
    logger.info("Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="Team Rocket Backend API",
    description="AI-powered marketing campaign optimization platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Railway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Railway needs broader CORS for preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check for Railway
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": "railway",
        "services": {
            "api": True,
            "storage": True,
            "ml_models": False  # Disabled for Railway
        }
    }

@app.get("/")
async def root():
    return {
        "message": "Team Rocket Backend API - Railway Deployment",
        "docs": "/docs",
        "health": "/health",
        "environment": "railway"
    }

# Import and include routes (with error handling)
try:
    from app.api.routes import campaigns, creative, ml, auth, dashboard

    app.include_router(campaigns.router, prefix="/api/campaigns", tags=["campaigns"])
    app.include_router(creative.router, prefix="/api/creative", tags=["creative"])
    app.include_router(ml.router, prefix="/api/ml", tags=["ml"])
    app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
    app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

    logger.info("All API routes loaded successfully")
except ImportError as e:
    logger.warning(f"Some routes could not be loaded: {e}")
    # Add minimal fallback routes
    @app.get("/api/campaigns")
    async def fallback_campaigns():
        return {"message": "Campaigns API - Railway deployment", "status": "available"}

    @app.get("/api/creative")
    async def fallback_creative():
        return {"message": "Creative API - Railway deployment", "status": "available"}

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc), "environment": "railway"}
    )

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))

    logger.info(f"Starting Railway server on port {port}")

    uvicorn.run(
        "main-railway:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Always disabled for Railway
        workers=1,
        log_level="info",
        access_log=True
    )