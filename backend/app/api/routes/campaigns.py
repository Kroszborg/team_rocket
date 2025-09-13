from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.types import (
    Campaign, CampaignCreateRequest, CampaignResponse,
    SimulationResults, OptimizationSuggestion
)
from app.core.storage import storage
from app.services.campaign_service import CampaignService

router = APIRouter()

@router.post("/", response_model=CampaignResponse)
async def create_campaign(campaign_data: CampaignCreateRequest):
    """Create a new campaign and run simulation"""
    try:
        result = await CampaignService.process_campaign(campaign_data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=dict)
async def get_campaigns(
    limit: Optional[int] = Query(10, ge=1, le=100),
    offset: Optional[int] = Query(0, ge=0)
):
    """Get all campaigns with pagination"""
    try:
        result = CampaignService.get_all_campaigns(
            limit=str(limit) if limit else None,
            offset=str(offset) if offset else None
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{campaign_id}", response_model=dict)
async def get_campaign(campaign_id: str):
    """Get a specific campaign"""
    try:
        result = CampaignService.get_campaign(campaign_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{campaign_id}", response_model=dict)
async def delete_campaign(campaign_id: str):
    """Delete a campaign"""
    try:
        result = CampaignService.delete_campaign(campaign_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{campaign_id}/results", response_model=dict)
async def get_campaign_results(campaign_id: str):
    """Get campaign results including simulation and optimization"""
    try:
        results = storage.get_results(campaign_id)
        if not results:
            raise HTTPException(status_code=404, detail="Campaign results not found")
        
        return {
            "success": True,
            "campaign_id": campaign_id,
            "campaign": results.campaign,
            "simulation": results.simulation,
            "optimization": results.optimization,
            "created_at": results.created_at
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))