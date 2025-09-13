from typing import Dict, List, Any
import logging

from app.models.types import OptimizationSuggestion, MarketingChannel
from app.services.ml_service import MLService, MLCampaignOptimizationRequest

logger = logging.getLogger(__name__)

# Channel performance multipliers based on industry data
CHANNEL_METRICS = {
    "facebook": {"reach_rate": 0.12, "engagement_rate": 0.018, "conversion_rate": 0.009, "cpc": 1.72},
    "instagram": {"reach_rate": 0.08, "engagement_rate": 0.058, "conversion_rate": 0.007, "cpc": 3.56},
    "google-ads": {"reach_rate": 0.35, "engagement_rate": 0.036, "conversion_rate": 0.039, "cpc": 2.69},
    "tiktok": {"reach_rate": 0.15, "engagement_rate": 0.054, "conversion_rate": 0.006, "cpc": 1.00},
    "youtube": {"reach_rate": 0.20, "engagement_rate": 0.018, "conversion_rate": 0.013, "cpc": 3.21},
    "linkedin": {"reach_rate": 0.06, "engagement_rate": 0.027, "conversion_rate": 0.028, "cpc": 5.26},
    "twitter": {"reach_rate": 0.048, "engagement_rate": 0.015, "conversion_rate": 0.005, "cpc": 3.75},
    "email": {"reach_rate": 0.85, "engagement_rate": 0.21, "conversion_rate": 0.18, "cpc": 0.10},
    "seo": {"reach_rate": 0.45, "engagement_rate": 0.024, "conversion_rate": 0.025, "cpc": 0.00},
    "influencer": {"reach_rate": 0.25, "engagement_rate": 0.037, "conversion_rate": 0.019, "cpc": 4.12},
}

# Category multipliers for different product types
CATEGORY_MULTIPLIERS = {
    "electronics": {"reach": 1.1, "engagement": 0.9, "conversion": 1.2},
    "fashion": {"reach": 1.2, "engagement": 1.4, "conversion": 0.8},
    "health": {"reach": 0.9, "engagement": 1.1, "conversion": 1.1},
    "home": {"reach": 0.8, "engagement": 0.8, "conversion": 1.0},
    "sports": {"reach": 1.0, "engagement": 1.2, "conversion": 0.9},
    "software": {"reach": 0.7, "engagement": 0.6, "conversion": 1.5},
    "education": {"reach": 0.6, "engagement": 0.7, "conversion": 1.3},
}

class SimulationService:
    
    @staticmethod
    def get_demographic_multiplier(campaign: Dict[str, Any]) -> float:
        """Calculate demographic multiplier"""
        multiplier = 1.0
        
        # Age-based multipliers
        age_range = campaign["targeting"]["age_range"]
        avg_age = (age_range["min"] + age_range["max"]) / 2
        if avg_age < 25:
            multiplier *= 1.2  # Younger audiences more engaged
        elif avg_age > 50:
            multiplier *= 0.8  # Older audiences less active online
        
        # Income-based multipliers
        income = campaign["targeting"]["income"]
        if income == "high":
            multiplier *= 1.3
        elif income == "medium":
            multiplier *= 1.1
        elif income == "low":
            multiplier *= 0.8
        
        # Interest targeting boost
        interests = campaign["targeting"].get("interests", [])
        if interests:
            multiplier *= 1 + (len(interests) * 0.1)
        
        return multiplier

    @staticmethod
    def run_campaign_simulation(campaign: Dict[str, Any]) -> Dict[str, Any]:
        """Run campaign simulation"""
        total_budget = campaign["budget"]["total"]
        duration = campaign["budget"]["duration"]
        daily_budget = total_budget / duration
        
        # Determine active channels
        preferred_channels = campaign["channels"].get("preferred", [])
        avoided_channels = campaign["channels"].get("avoided", [])
        
        if preferred_channels:
            active_channels = preferred_channels
        else:
            active_channels = [ch for ch in CHANNEL_METRICS.keys() if ch not in avoided_channels]
        
        budget_per_channel = total_budget / len(active_channels) if active_channels else 0
        
        # Get category and demographic multipliers
        category = campaign["product"]["category"]
        category_multiplier = CATEGORY_MULTIPLIERS.get(category, {
            "reach": 1.0, "engagement": 1.0, "conversion": 1.0
        })
        demo_multiplier = SimulationService.get_demographic_multiplier(campaign)
        
        total_reach = 0
        total_engagement = 0
        total_conversions = 0
        total_spend = 0
        
        channel_breakdown = {}
        
        # Calculate metrics for each active channel
        for channel in active_channels:
            metrics = CHANNEL_METRICS.get(channel, CHANNEL_METRICS["facebook"])
            channel_budget = budget_per_channel
            
            # Calculate base metrics
            base_reach = (channel_budget / metrics["cpc"]) * metrics["reach_rate"]
            reach = int(base_reach * category_multiplier["reach"] * demo_multiplier)
            
            engagement = int(reach * metrics["engagement_rate"] * category_multiplier["engagement"])
            conversions = int(reach * metrics["conversion_rate"] * category_multiplier["conversion"])
            
            revenue = conversions * campaign["product"]["price"]
            roi = ((revenue - channel_budget) / channel_budget) * 100 if channel_budget > 0 else 0
            
            channel_breakdown[channel] = {
                "spend": channel_budget,
                "reach": reach,
                "conversions": conversions,
                "roi": roi,
            }
            
            total_reach += reach
            total_engagement += engagement
            total_conversions += conversions
            total_spend += channel_budget
        
        # Calculate overall metrics
        total_revenue = total_conversions * campaign["product"]["price"]
        overall_roi = ((total_revenue - total_spend) / total_spend) * 100 if total_spend > 0 else 0
        cost_per_conversion = total_spend / total_conversions if total_conversions > 0 else 0
        
        # Generate timeline data
        timeline = []
        for day in range(1, min(duration + 1, 31)):  # Max 30 days for timeline
            progress_factor = min(1, day / 7)  # Ramp up over first week
            daily_reach = int((total_reach / duration) * progress_factor)
            daily_conversions = int((total_conversions / duration) * progress_factor)
            
            timeline.append({
                "day": day,
                "reach": daily_reach,
                "conversions": daily_conversions,
                "spend": daily_budget,
            })
        
        return {
            "campaign_id": campaign["id"],
            "metrics": {
                "estimated_reach": total_reach,
                "estimated_engagement": total_engagement,
                "estimated_conversions": total_conversions,
                "estimated_roi": round(overall_roi, 2),
                "cost_per_conversion": round(cost_per_conversion, 2),
            },
            "channel_breakdown": channel_breakdown,
            "timeline": timeline,
        }

    @staticmethod
    async def generate_optimization_suggestions(
        campaign: Dict[str, Any], 
        results: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate optimization suggestions using ML when available"""
        try:
            # Try ML-powered optimization first
            health_status = await MLService.health_check()
            if health_status["campaign_model_loaded"]:
                # Convert campaign to ML request format
                age_range = campaign["targeting"]["age_range"]
                avg_age = (age_range["min"] + age_range["max"]) / 2
                
                # Map values for ML model
                gender_map = {"male": "man", "female": "woman", "all": "all"}
                income_map = {"low": "low", "medium": "high", "high": "high", "all": "high"}
                
                # Estimate creative quality
                creative_quality = 0.7  # Default
                if campaign.get("creatives"):
                    avg_score = sum(c.get("score", {}).get("overall", 70) for c in campaign["creatives"]) / len(campaign["creatives"])
                    creative_quality = avg_score / 100
                
                ml_request = MLCampaignOptimizationRequest(
                    total_budget=campaign["budget"]["total"],
                    aov=campaign["product"]["price"],
                    age=avg_age,
                    gender=gender_map.get(campaign["targeting"]["gender"], "all"),
                    income_level=income_map.get(campaign["targeting"]["income"], "high"),
                    creative_quality=creative_quality,
                    campaign_days=campaign["budget"]["duration"],
                    target_margin=campaign["product"]["target_margin"] / 100
                )
                
                ml_response = await MLService.optimize_campaign_budget(ml_request)
                
                # Convert ML response to optimization suggestions
                suggestions = []
                current_allocation = campaign["budget"]["channels"]
                
                # Channel mapping
                channel_mapping = {
                    "instagram": "instagram",
                    "google": "google-ads",
                    "tiktok": "tiktok",
                    "facebook": "facebook",
                    "youtube": "youtube",
                    "linkedin": "linkedin"
                }
                
                for ml_channel, optimal_amount in ml_response.recommended_split.items():
                    app_channel = channel_mapping.get(ml_channel)
                    if app_channel:
                        current_amount = getattr(current_allocation, app_channel, 0)
                        difference = optimal_amount - current_amount
                        
                        if abs(difference) > campaign["budget"]["total"] * 0.05:  # 5% threshold
                            suggestions.append({
                                "type": "budget_reallocation",
                                "title": f"{'Increase' if difference > 0 else 'Decrease'} {app_channel} budget",
                                "description": f"{'Increase' if difference > 0 else 'Reduce'} budget allocation {'to' if difference > 0 else 'from'} {app_channel} by ${abs(difference):.2f}",
                                "impact": {
                                    "roi_increase": ml_response.predicted_roi * 100 * (abs(difference) / campaign["budget"]["total"]),
                                    "reach_increase": 10 * (abs(difference) / campaign["budget"]["total"]),
                                    "conversion_increase": 8 * (abs(difference) / campaign["budget"]["total"]),
                                },
                                "changes": {
                                    "to_channel": app_channel if difference > 0 else None,
                                    "from_channel": app_channel if difference < 0 else None,
                                    "amount": abs(difference),
                                }
                            })
                
                if suggestions:
                    return suggestions
                    
        except Exception as e:
            logger.warning(f"ML optimization failed, using fallback: {e}")
        
        # Fallback to rule-based optimization
        return SimulationService.generate_optimization_suggestions_fallback(campaign, results)

    @staticmethod
    def generate_optimization_suggestions_fallback(
        campaign: Dict[str, Any], 
        results: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Fallback rule-based optimization suggestions"""
        suggestions = []
        
        # Find best and worst performing channels
        channel_breakdown = results.get("channel_breakdown", {})
        if len(channel_breakdown) >= 2:
            channel_performance = [
                {
                    "channel": channel,
                    "roi": metrics["roi"],
                    "conversions": metrics["conversions"],
                    "spend": metrics["spend"],
                }
                for channel, metrics in channel_breakdown.items()
            ]
            channel_performance.sort(key=lambda x: x["roi"], reverse=True)
            
            best_channel = channel_performance[0]
            worst_channel = channel_performance[-1]
            
            if best_channel["roi"] > worst_channel["roi"] + 50:
                suggestions.append({
                    "type": "budget_reallocation",
                    "title": "Reallocate Budget to High-Performing Channels",
                    "description": f"Move 30% of budget from {worst_channel['channel']} to {best_channel['channel']} for better ROI",
                    "impact": {
                        "roi_increase": 15,
                        "reach_increase": 8,
                        "conversion_increase": 12,
                    },
                    "changes": {
                        "from_channel": worst_channel["channel"],
                        "to_channel": best_channel["channel"],
                        "amount": int(worst_channel["spend"] * 0.3),
                    },
                })
        
        # Suggest high-performing channels if budget allows
        budget_total = campaign["budget"]["total"]
        current_channels = set(campaign["channels"].get("preferred", []))
        
        if "google-ads" not in current_channels and budget_total > 500:
            suggestions.append({
                "type": "channel_addition",
                "title": "Add Google Ads for Better Reach",
                "description": "Google Ads typically provides high-intent traffic with good conversion rates",
                "impact": {
                    "roi_increase": 12,
                    "reach_increase": 25,
                    "conversion_increase": 18,
                },
                "changes": {
                    "to_channel": "google-ads",
                    "amount": int(budget_total * 0.25),
                },
            })
        
        return suggestions