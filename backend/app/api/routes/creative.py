from fastapi import APIRouter, HTTPException
from app.models.types import (
    CreativeScoreRequest, CreativeScoreResponse,
    CreativeSuggestionsRequest, CreativeSuggestionsResponse,
    Creative
)
from app.services.creative_service import CreativeService

router = APIRouter()

@router.post("/score", response_model=CreativeScoreResponse)
async def score_creative(request: CreativeScoreRequest):
    """Score creative content using AI models"""
    try:
        # Convert request to Creative object
        creative = Creative(
            id="temp",
            title=request.title,
            description=request.description,
            callToAction=request.cta,
            channel=request.channel
        )
        
        score = await CreativeService.score_creative(creative)
        
        return CreativeScoreResponse(
            success=True,
            score=score
        )
    except Exception as e:
        return CreativeScoreResponse(
            success=False,
            error=str(e)
        )

@router.get("/suggestions", response_model=CreativeSuggestionsResponse)
async def generate_suggestions(
    channel: str,
    product_name: str = "Your Product",
    category: str = "electronics"
):
    """Generate creative suggestions"""
    try:
        suggestions = await CreativeService.generate_suggestions(
            channel=channel,
            product_name=product_name,
            category=category
        )
        
        return CreativeSuggestionsResponse(
            success=True,
            suggestions=suggestions
        )
    except Exception as e:
        return CreativeSuggestionsResponse(
            success=False,
            error=str(e)
        )