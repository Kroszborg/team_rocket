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
            # Scale from 1-10 to 0-100 and ensure professional scores
            def scale_score(score):
                # Convert 1-10 to 60-95 for more professional appearance
                scaled = ((score - 1) / 9) * 35 + 60
                return round(min(95, max(60, scaled)), 1)

            # Create breakdown dict with proper field names
            breakdown_dict = {
                "clarity": scale_score(ml_response.scores["title"]),
                "urgency": scale_score(ml_response.scores["description"]),
                "relevance": scale_score(ml_response.scores["channel_fit"]),
                "callToAction": scale_score(ml_response.scores["cta"])  # Use alias name directly
            }

            score = CreativeScore(
                overall=scale_score(ml_response.scores["final"]),
                breakdown=CreativeBreakdown(**breakdown_dict),
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
        """Fallback rule-based creative scoring - professional and encouraging"""
        text = f"{creative.title} {creative.description} {creative.call_to_action}".lower()
        words = text.split()
        word_count = len(words)

        # More generous scoring logic for professional appearance
        clarity_base = 75
        urgency_base = 65
        relevance_base = 72
        cta_base = 68

        # Clarity scoring (60-95 range)
        if 8 <= word_count <= 40:
            clarity_score = clarity_base + 15
        elif word_count < 5:
            clarity_score = clarity_base - 8
        else:
            clarity_score = clarity_base + 5

        # Urgency scoring with more keywords
        urgency_words = ["now", "today", "limited", "hurry", "save", "deal", "offer", "sale", "free", "exclusive"]
        urgency_score = urgency_base + sum(8 for word in urgency_words if word in text)

        # Relevance scoring with benefit words
        benefit_words = ["you", "your", "free", "save", "best", "new", "premium", "quality", "guaranteed"]
        relevance_score = relevance_base + sum(4 for word in benefit_words if word in text)

        # CTA scoring
        if creative.call_to_action and len(creative.call_to_action.strip()) > 0:
            cta_words = ["buy", "get", "shop", "try", "start", "join", "download", "order", "call", "click"]
            cta_bonus = sum(6 for word in cta_words if word in creative.call_to_action.lower())
            cta_score = min(92, cta_base + 15 + cta_bonus)
        else:
            cta_score = cta_base - 20

        # Cap scores to realistic ranges
        clarity_score = min(95, max(65, clarity_score))
        urgency_score = min(90, max(60, urgency_score))
        relevance_score = min(93, max(68, relevance_score))
        cta_score = min(92, max(50, cta_score))

        overall_score = (clarity_score + urgency_score + relevance_score + cta_score) / 4

        # Professional, encouraging suggestions
        suggestions = []
        if clarity_score < 75:
            suggestions.append("Consider using more conversational language to enhance clarity")
        if urgency_score < 70:
            suggestions.append("Adding time-sensitive elements could boost engagement")
        if relevance_score < 75:
            suggestions.append("Highlighting specific benefits may strengthen appeal")
        if cta_score < 70:
            suggestions.append("Using more direct action verbs could improve response rates")

        # Add positive suggestions for high performers
        if overall_score >= 80:
            suggestions.append("Excellent foundation - consider A/B testing variations")

        # Create breakdown dict with proper field names
        breakdown_dict = {
            "clarity": round(clarity_score, 1),
            "urgency": round(urgency_score, 1),
            "relevance": round(relevance_score, 1),
            "callToAction": round(cta_score, 1)  # Use alias name directly
        }

        return CreativeScore(
            overall=round(overall_score, 1),
            breakdown=CreativeBreakdown(**breakdown_dict),
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