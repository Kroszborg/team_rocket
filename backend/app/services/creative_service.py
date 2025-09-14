from typing import List
import logging

from app.models.types import Creative, CreativeScore, CreativeBreakdown, MLCreativeScoreRequest
from app.services.ml_service import MLService

logger = logging.getLogger(__name__)

class CreativeService:
    
    @staticmethod
    def validate_creative(creative: Creative) -> None:
        """Validate creative data"""
        if not creative or not creative.title or not creative.description:
            raise ValueError("Invalid creative data provided")

    @staticmethod
    async def score_creative(creative: Creative) -> CreativeScore:
        """Score creative content using ML models"""
        CreativeService.validate_creative(creative)
        
        try:
            # Use ML service for scoring
            ml_request = MLCreativeScoreRequest(
                channel=creative.channel,
                title=creative.title,
                description=creative.description,
                cta=creative.call_to_action
            )
            
            ml_response = await MLService.score_creative_content(ml_request)
            
            # Convert ML response to CreativeScore format
            score = CreativeScore(
                overall=ml_response.scores["final"],
                breakdown=CreativeBreakdown(
                    clarity=ml_response.scores["title"],
                    urgency=ml_response.scores["description"],
                    relevance=ml_response.scores["channel_fit"],
                    call_to_action=ml_response.scores["cta"]
                ),
                suggestions=[
                    *ml_response.feedback,
                    *ml_response.improvements.get("title", [])[:2],
                    *ml_response.improvements.get("description", [])[:2],
                    *ml_response.improvements.get("cta", [])[:2]
                ]
            )
            
            return score
            
        except Exception as e:
            logger.warning(f"ML scoring failed, using fallback: {e}")
            # Fallback to rule-based scoring
            return CreativeService.score_creative_fallback(creative)

    @staticmethod
    def score_creative_fallback(creative: Creative) -> CreativeScore:
        """Fallback rule-based creative scoring"""
        # Simple rule-based scoring implementation
        text = f"{creative.title} {creative.description} {creative.call_to_action}".lower()
        words = text.split()
        word_count = len(words)
        
        # Basic scoring logic
        clarity_score = 70 if 10 <= word_count <= 50 else 50
        urgency_score = 60 if any(word in text for word in ["now", "today", "limited", "hurry"]) else 40
        relevance_score = 65 if any(word in text for word in ["you", "your", "free", "save"]) else 45
        cta_score = 80 if creative.call_to_action and len(creative.call_to_action.strip()) > 0 else 30
        
        overall_score = (clarity_score + urgency_score + relevance_score + cta_score) / 4
        
        suggestions = []
        if clarity_score < 60:
            suggestions.append("Simplify your language for better clarity")
        if urgency_score < 50:
            suggestions.append("Add time-sensitive language to create urgency")
        if relevance_score < 50:
            suggestions.append("Focus more on customer benefits")
        if cta_score < 60:
            suggestions.append("Strengthen your call-to-action")
        
        return CreativeScore(
            overall=round(overall_score, 1),
            breakdown=CreativeBreakdown(
                clarity=clarity_score,
                urgency=urgency_score,
                relevance=relevance_score,
                call_to_action=cta_score
            ),
            suggestions=suggestions[:3]
        )

    @staticmethod
    async def generate_suggestions(
        channel: str,
        product_name: str,
        category: str
    ) -> List[str]:
        """Generate creative suggestions"""
        if not channel or not product_name or not category:
            raise ValueError("Missing required parameters")
        
        try:
            # Try ML-powered suggestions first
            ml_request = MLCreativeScoreRequest(
                channel=channel,
                title=f"{product_name} - Premium {category}",
                description=f"Discover the best {product_name} for your {category} needs. High quality, great value.",
                cta="Shop Now"
            )
            
            ml_response = await MLService.score_creative_content(ml_request)
            
            # Combine all suggestions
            all_suggestions = [
                *ml_response.improvements.get("title", []),
                *ml_response.improvements.get("description", []),
            ]
            
            if all_suggestions:
                return all_suggestions[:6]  # Return top 6 suggestions
                
        except Exception as e:
            logger.warning(f"ML suggestions unavailable, using fallback: {e}")
        
        # Fallback to rule-based suggestions
        return CreativeService.generate_suggestions_fallback(channel, product_name, category)

    @staticmethod
    def generate_suggestions_fallback(channel: str, product_name: str, category: str) -> List[str]:
        """Fallback rule-based suggestions"""
        channel_specific = {
            "facebook": [
                f"🚀 Discover {product_name} - Transform Your {category} Experience!",
                f"{product_name}: The #1 Choice for Smart {category} Lovers. Get Yours Today!",
                f"Why settle for ordinary? Upgrade to {product_name} and see the difference!"
            ],
            "instagram": [
                f"✨ {product_name} - Because You Deserve the Best ✨",
                f"📸 Show off your new {product_name}! Tag us for a chance to win!",
                f"🔥 {product_name} is trending! Join thousands of happy customers"
            ],
            "google-ads": [
                f"Buy {product_name} - Free Shipping & 30-Day Returns",
                f"{product_name} Sale - Save Up to 40% Today Only",
                f"Top-Rated {product_name} - Order Now & Save"
            ],
            "linkedin": [
                f"Boost Your Professional {category} Game with {product_name}",
                f"Industry Leaders Choose {product_name}. Here's Why You Should Too.",
                f"{product_name}: The Professional's Choice for {category}"
            ],
        }
        
        return channel_specific.get(channel, [
            f"Experience the difference with {product_name}",
            f"{product_name} - Quality you can trust",
            f"Upgrade your {category} with {product_name} today"
        ])