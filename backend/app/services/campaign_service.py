from datetime import datetime
from typing import Dict, Any, Optional
import logging

from app.models.types import Campaign, CampaignCreateRequest
from app.core.storage import storage
from app.services.simulation_service import SimulationService
from app.services.ml_service import MLService
# from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

class ValidationError(Exception):
    def __init__(self, message: str, errors: list = None):
        super().__init__(message)
        self.errors = errors or []

class SimulationError(Exception):
    def __init__(self, message: str, campaign_id: str = None):
        super().__init__(message)
        self.campaign_id = campaign_id

class NotFoundError(Exception):
    pass

class CampaignService:
    
    @staticmethod
    def validate_campaign(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate campaign data"""
        if not data:
            raise ValidationError("Campaign data is required")

        required_fields = ["name", "product", "targeting", "budget", "channels"]
        for field in required_fields:
            if field not in data:
                raise ValidationError(f"Missing required field: {field}")

        # Validate budget
        if data["budget"]["total"] <= 0:
            raise ValidationError("Budget must be greater than 0")

        if data["budget"]["duration"] <= 0:
            raise ValidationError("Campaign duration must be greater than 0")

        # Validate targeting - handle both ageRange and age_range
        age_range = data["targeting"].get("ageRange", data["targeting"].get("age_range"))
        if age_range and age_range["min"] >= age_range["max"]:
            raise ValidationError("Age range minimum must be less than maximum")

        return data

    @staticmethod
    def validate_business_rules(campaign_data: Dict[str, Any]) -> None:
        """Validate business rules"""
        # Additional business logic validation can be added here
        pass

    @staticmethod
    def generate_campaign_id() -> str:
        """Generate unique campaign ID"""
        timestamp = int(datetime.utcnow().timestamp() * 1000)
        import random
        random_part = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        return f"campaign_{timestamp}_{random_part}"

    @staticmethod
    def create_campaign(campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create campaign object"""
        campaign = {
            "id": CampaignService.generate_campaign_id(),
            "name": campaign_data["name"].strip(),
            "product": campaign_data["product"],
            "targeting": campaign_data["targeting"],
            "budget": campaign_data["budget"],
            "channels": campaign_data["channels"],
            "creatives": campaign_data.get("creatives", []),
            "status": "draft",
            "created_at": datetime.utcnow()
        }
        return campaign

    @staticmethod
    async def process_campaign(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process campaign creation with simulation"""
        try:
            # Validate campaign data
            campaign_data = CampaignService.validate_campaign(raw_data)
            
            # Additional business logic validation
            CampaignService.validate_business_rules(campaign_data)
            
            # Create campaign object
            campaign = CampaignService.create_campaign(campaign_data)
            
            # Store campaign
            storage.save_campaign(campaign)
            
            # Run simulation
            try:
                simulation_results = SimulationService.run_campaign_simulation(campaign)
                optimization_suggestions = await SimulationService.generate_optimization_suggestions(
                    campaign, simulation_results
                )

                # Get Gemini AI enhancements
                # gemini_insights = await gemini_service.enhance_campaign_strategy(campaign_data)
                gemini_insights = {"insights": "AI insights temporarily disabled"}
                if gemini_insights.get("success"):
                    # Add Gemini insights to optimization suggestions
                    gemini_enhanced_suggestions = gemini_insights.get("enhanced_strategy", {})
                    if "recommendations" in gemini_enhanced_suggestions:
                        # Convert Gemini recommendations to optimization suggestion format
                        for idx, rec in enumerate(gemini_enhanced_suggestions["recommendations"]):
                            optimization_suggestions.append({
                                "type": "ai_recommendation",
                                "title": f"AI Insight #{idx + 1}",
                                "description": rec,
                                "impact": {
                                    "roi_increase": 10,
                                    "reach_increase": 5,
                                    "conversion_increase": 8
                                },
                                "source": "gemini_ai"
                            })

            except Exception as error:
                logger.error(f"Simulation error: {error}")
                raise SimulationError('Failed to run campaign simulation', campaign["id"])

            # Store results with Gemini insights
            enhanced_results = {
                "simulation": simulation_results,
                "optimization": optimization_suggestions,
                "gemini_insights": gemini_insights if 'gemini_insights' in locals() else None
            }

            storage.save_results(
                campaign["id"],
                campaign,
                simulation_results,
                optimization_suggestions
            )
            
            return {
                "success": True,
                "campaign_id": campaign["id"],
                "message": "Campaign created and simulation completed successfully",
                "stats": {
                    "reach": simulation_results.get("metrics", {}).get("estimated_reach", 0),
                    "roi": simulation_results.get("metrics", {}).get("estimated_roi", 0),
                    "conversions": simulation_results.get("metrics", {}).get("estimated_conversions", 0),
                }
            }
            
        except ValidationError as e:
            raise Exception(f"Validation error: {str(e)}")
        except Exception as e:
            logger.error(f"Campaign processing error: {e}")
            raise Exception(f"Failed to process campaign: {str(e)}")

    @staticmethod
    def get_campaign(campaign_id: str) -> Dict[str, Any]:
        """Get a specific campaign"""
        campaign = storage.get_campaign(campaign_id)
        if not campaign:
            raise NotFoundError("Campaign not found")
        return {"success": True, "campaign": campaign}

    @staticmethod
    def get_all_campaigns(limit: Optional[str] = None, offset: Optional[str] = None) -> Dict[str, Any]:
        """Get all campaigns with pagination"""
        campaigns = storage.get_all_campaigns()

        # Add default status for campaigns that don't have it
        for campaign in campaigns:
            if "status" not in campaign:
                campaign["status"] = "draft"

        # Sort by creation date (newest first)
        campaigns = sorted(campaigns, key=lambda x: x.get("created_at", datetime.min), reverse=True)

        # Apply pagination
        limit_num = int(limit) if limit else 10
        offset_num = int(offset) if offset else 0
        limit_num = max(1, min(100, limit_num))  # Clamp between 1 and 100
        offset_num = max(0, offset_num)

        paginated_campaigns = campaigns[offset_num:offset_num + limit_num]

        return {
            "success": True,
            "campaigns": paginated_campaigns,
            "pagination": {
                "total": len(campaigns),
                "limit": limit_num,
                "offset": offset_num,
                "has_more": offset_num + limit_num < len(campaigns)
            }
        }

    @staticmethod
    def delete_campaign(campaign_id: str) -> Dict[str, Any]:
        """Delete a campaign"""
        deleted = storage.delete_campaign(campaign_id)
        
        if not deleted:
            raise NotFoundError("Campaign not found")
        
        return {
            "success": True,
            "message": "Campaign deleted successfully"
        }