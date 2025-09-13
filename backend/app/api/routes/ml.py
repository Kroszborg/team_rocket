from fastapi import APIRouter, HTTPException
from app.models.types import (
    MLCampaignOptimizationRequest, MLCampaignOptimizationResponse,
    MLCreativeScoreRequest, MLCreativeScoreResponse
)
from app.services.ml_service import MLService

router = APIRouter()

@router.post("/campaign/optimize", response_model=MLCampaignOptimizationResponse)
async def optimize_campaign(request: MLCampaignOptimizationRequest):
    """Optimize campaign budget allocation using ML models"""
    try:
        result = await MLService.optimize_campaign_budget(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/creative/score", response_model=MLCreativeScoreResponse)
async def score_creative(request: MLCreativeScoreRequest):
    """Score creative content using NLP models"""
    try:
        result = await MLService.score_creative_content(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def ml_health_check():
    """Check ML service health"""
    health_status = await MLService.health_check()
    return {
        "status": "healthy" if health_status["models_loaded"] else "degraded",
        "models": health_status
    }