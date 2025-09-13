"""
User dashboard routes for saved campaigns and data
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from app.services.database_service import database_service
from app.core.auth_middleware import require_auth, get_current_user

router = APIRouter()

class SaveCampaignRequest(BaseModel):
    name: str
    campaign_data: Dict[str, Any]
    optimization_results: Dict[str, Any]

class UpdateCampaignRequest(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None

@router.get("/campaigns")
async def get_user_campaigns(
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Get all campaigns for the current user"""
    campaigns = await database_service.get_user_campaigns(
        user_id=current_user["id"],
        limit=limit
    )
    
    return {
        "success": True,
        "campaigns": campaigns,
        "total": len(campaigns)
    }

@router.post("/campaigns")
async def save_campaign(
    request: SaveCampaignRequest,
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Save a new campaign"""
    campaign_id = await database_service.save_campaign(
        user_id=current_user["id"],
        campaign_data={
            **request.campaign_data,
            "name": request.name
        },
        optimization_results=request.optimization_results
    )
    
    if not campaign_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save campaign"
        )
    
    return {
        "success": True,
        "campaign_id": campaign_id,
        "message": "Campaign saved successfully"
    }

@router.get("/campaigns/{campaign_id}")
async def get_campaign(
    campaign_id: str,
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Get specific campaign by ID"""
    campaign = await database_service.get_campaign_by_id(
        campaign_id=campaign_id,
        user_id=current_user["id"]
    )
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return {
        "success": True,
        "campaign": campaign
    }

@router.put("/campaigns/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    request: UpdateCampaignRequest,
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Update campaign"""
    updates = {}
    if request.name:
        updates["name"] = request.name
    if request.status:
        updates["status"] = request.status
    
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No updates provided"
        )
    
    success = await database_service.update_campaign(
        campaign_id=campaign_id,
        user_id=current_user["id"],
        updates=updates
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found or update failed"
        )
    
    return {
        "success": True,
        "message": "Campaign updated successfully"
    }

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Delete campaign"""
    success = await database_service.delete_campaign(
        campaign_id=campaign_id,
        user_id=current_user["id"]
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return {
        "success": True,
        "message": "Campaign deleted successfully"
    }

@router.get("/campaigns/{campaign_id}/creative-tests")
async def get_campaign_creative_tests(
    campaign_id: str,
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Get all creative tests for a campaign"""
    tests = await database_service.get_campaign_creative_tests(
        campaign_id=campaign_id,
        user_id=current_user["id"]
    )
    
    return {
        "success": True,
        "creative_tests": tests,
        "total": len(tests)
    }

@router.post("/campaigns/{campaign_id}/creative-tests")
async def save_creative_test(
    campaign_id: str,
    creative_data: Dict[str, Any],
    test_results: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Save creative test results"""
    test_id = await database_service.save_creative_test(
        user_id=current_user["id"],
        campaign_id=campaign_id,
        creative_data=creative_data,
        results=test_results
    )
    
    if not test_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save creative test"
        )
    
    return {
        "success": True,
        "test_id": test_id,
        "message": "Creative test saved successfully"
    }

@router.get("/stats")
async def get_user_stats(
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Get user statistics"""
    stats = await database_service.get_user_stats(
        user_id=current_user["id"]
    )
    
    return {
        "success": True,
        "stats": stats
    }

@router.get("/health")
async def dashboard_health_check():
    """Check dashboard service health"""
    return {
        "service": "dashboard",
        "status": "healthy" if database_service.supabase else "degraded",
        "database_connected": database_service.supabase is not None
    }