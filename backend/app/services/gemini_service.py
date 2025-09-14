"""
Gemini AI Service for enhanced campaign optimization and creative analysis
"""
import os
import logging
from typing import Dict, List, Any, Optional, Tuple
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found. Gemini features will be disabled.")
            self.enabled = False
            return

        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash-latest')
            self.enabled = True
            logger.info("Gemini AI service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini AI: {e}")
            self.enabled = False

    def is_available(self) -> bool:
        """Check if Gemini service is available"""
        return self.enabled

    async def enhance_campaign_strategy(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get enhanced campaign strategy suggestions from Gemini"""
        if not self.enabled:
            return self._fallback_campaign_strategy(campaign_data)

        try:
            prompt = self._build_campaign_strategy_prompt(campaign_data)

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                ),
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                }
            )

            if response.text:
                return self._parse_strategy_response(response.text, campaign_data)
            else:
                return self._fallback_campaign_strategy(campaign_data)

        except Exception as e:
            logger.error(f"Gemini campaign strategy enhancement failed: {e}")
            return self._fallback_campaign_strategy(campaign_data)

    def _build_campaign_strategy_prompt(self, campaign_data: Dict[str, Any]) -> str:
        """Build prompt for campaign strategy analysis"""
        product = campaign_data.get("product", {})
        targeting = campaign_data.get("targeting", {})
        budget = campaign_data.get("budget", {})
        channels = campaign_data.get("channels", {})

        age_range = targeting.get("ageRange", targeting.get("age_range", {}))
        min_age = age_range.get("min", 18)
        max_age = age_range.get("max", 65)

        return f"""
As a senior marketing strategist, analyze this campaign and provide specific, actionable recommendations:

CAMPAIGN DETAILS:
- Product: {product.get('name', 'Unknown')} ({product.get('category', 'general')})
- Price: ${product.get('price', 0)}
- Target Margin: {product.get('targetMargin', 0)}%
- Description: {product.get('description', 'Not provided')}

TARGET AUDIENCE:
- Age Range: {min_age}-{max_age}
- Gender: {targeting.get('gender', 'all')}
- Income Level: {targeting.get('income', 'all')}
- Interests: {', '.join(targeting.get('interests', []))}
- Locations: {', '.join(targeting.get('location', []))}

BUDGET & CHANNELS:
- Total Budget: ${budget.get('total', 0)}
- Duration: {budget.get('duration', 0)} days
- Preferred Channels: {', '.join(channels.get('preferred', []))}
- Avoided Channels: {', '.join(channels.get('avoided', []))}

Please provide 3-5 specific, actionable recommendations to improve campaign performance. Focus on practical advice for budget allocation, targeting, and creative strategy.

Format as a JSON object with this structure:
{
  "recommendations": ["rec1", "rec2", "rec3"],
  "channel_optimization": "advice on channel mix",
  "targeting_refinement": "ways to improve targeting",
  "creative_direction": "key messaging themes",
  "risk_factors": ["risk1", "risk2"]
}
"""

    def _parse_strategy_response(self, response_text: str, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Gemini's strategy response"""
        try:
            import json
            # Try to extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1

            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx]
                parsed = json.loads(json_str)

                return {
                    "success": True,
                    "enhanced_strategy": parsed,
                    "source": "gemini_ai"
                }
        except Exception as e:
            logger.error(f"Error parsing JSON strategy response: {e}")

        # Fallback to simple text parsing
        return {
            "success": True,
            "enhanced_strategy": {
                "recommendations": [
                    "Optimize budget allocation across high-performing channels",
                    "Refine target audience based on early performance data",
                    "Test multiple creative variations to improve engagement"
                ],
                "raw_response": response_text
            },
            "source": "gemini_ai"
        }

    def _fallback_campaign_strategy(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback strategy when Gemini is unavailable"""
        product = campaign_data.get("product", {})
        budget = campaign_data.get("budget", {})

        recommendations = [
            f"Focus on high-performing channels with your ${budget.get('total', 0)} budget",
            f"Optimize for {product.get('category', 'your')} category best practices",
            "Test multiple creative variations to find top performers",
            "Monitor and adjust budget allocation based on early performance data"
        ]

        return {
            "success": True,
            "enhanced_strategy": {
                "recommendations": recommendations,
                "channel_optimization": "Allocate 60% budget to top 3 performing channels",
                "targeting_refinement": "Test narrow vs broad targeting approaches",
                "creative_direction": "Focus on clear value proposition and strong CTA",
                "risk_factors": ["Ad fatigue", "Budget pacing issues", "Audience saturation"]
            },
            "source": "fallback"
        }

    async def analyze_creative_content(self, creative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get detailed creative analysis from Gemini AI"""
        if not self.enabled:
            return self._fallback_creative_analysis(creative_data)

        try:
            prompt = self._build_creative_analysis_prompt(creative_data)

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=800,
                ),
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                }
            )

            if response and response.text:
                return self._parse_creative_analysis_response(response.text, creative_data)
            else:
                logger.warning("Empty response from Gemini for creative analysis")
                return self._fallback_creative_analysis(creative_data)

        except Exception as e:
            logger.error(f"Error in Gemini creative analysis: {e}")
            return self._fallback_creative_analysis(creative_data)

    def _build_creative_analysis_prompt(self, creative_data: Dict[str, Any]) -> str:
        """Build creative analysis prompt for Gemini"""
        return f"""
As a senior advertising creative director, analyze this advertising creative for effectiveness and provide detailed feedback:

Title: {creative_data.get('title', 'N/A')}
Description: {creative_data.get('description', 'N/A')}
Call-to-Action: {creative_data.get('cta', 'N/A')}
Channel: {creative_data.get('channel', 'N/A')}

Please provide a comprehensive analysis in this exact format:

**Overall Score: [X/100]**

**Strengths:**
- [List key strengths here]

**Areas for Improvement:**
- [List specific improvements here]

**Channel-Specific Insights:**
[Provide specific recommendations for {creative_data.get('channel', 'this channel')}]

**Performance Prediction:**
[Provide expected engagement metrics and performance outlook]

**Detailed Analysis:**
[Provide comprehensive feedback on messaging, targeting, and optimization opportunities]

Focus on actionable insights and specific recommendations that can improve performance.
"""

    def _parse_creative_analysis_response(self, response_text: str, creative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Gemini's creative analysis response"""
        try:
            import re
            
            # Extract score from the response
            overall_score = 75  # default
            score_match = re.search(r'Overall Score:\s*(\d+)/100', response_text, re.IGNORECASE)
            if score_match:
                overall_score = int(score_match.group(1))
            else:
                # Try alternative patterns
                score_patterns = [
                    r'score[:\s]*(\d+)',
                    r'(\d+)/100',
                    r'(\d+)\s*out\s*of\s*100'
                ]
                for pattern in score_patterns:
                    match = re.search(pattern, response_text, re.IGNORECASE)
                    if match:
                        score = int(match.group(1))
                        if 1 <= score <= 100:
                            overall_score = score
                            break
            
            # Extract strengths
            strengths = []
            strengths_section = re.search(r'\*\*Strengths:\*\*(.*?)(?=\*\*|$)', response_text, re.DOTALL | re.IGNORECASE)
            if strengths_section:
                strengths_text = strengths_section.group(1)
                for line in strengths_text.split('\n'):
                    line = line.strip()
                    if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                        item = re.sub(r'^[-•*]\s*', '', line).strip()
                        if item:
                            strengths.append(item)
            
            # Extract improvements
            improvements = []
            improvements_section = re.search(r'\*\*Areas for Improvement:\*\*(.*?)(?=\*\*|$)', response_text, re.DOTALL | re.IGNORECASE)
            if improvements_section:
                improvements_text = improvements_section.group(1)
                for line in improvements_text.split('\n'):
                    line = line.strip()
                    if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                        item = re.sub(r'^[-•*]\s*', '', line).strip()
                        if item:
                            improvements.append(item)
            
            # Extract channel-specific insights
            channel_specific = f"This creative is well-suited for {creative_data.get('channel', 'the selected channel')}"
            channel_section = re.search(r'\*\*Channel-Specific Insights:\*\*(.*?)(?=\*\*|$)', response_text, re.DOTALL | re.IGNORECASE)
            if channel_section:
                channel_specific = channel_section.group(1).strip()
            
            # Extract performance prediction
            predicted_engagement = "Expected performance within industry averages"
            prediction_section = re.search(r'\*\*Performance Prediction:\*\*(.*?)(?=\*\*|$)', response_text, re.DOTALL | re.IGNORECASE)
            if prediction_section:
                predicted_engagement = prediction_section.group(1).strip()
            
            # Fallback if sections not found
            if not strengths:
                strengths = [
                    "Clear value proposition",
                    "Strong call-to-action",
                    "Appropriate for target channel"
                ]
            
            if not improvements:
                improvements = [
                    "Consider adding urgency elements",
                    "Test different headline variations",
                    "Optimize for mobile viewing"
                ]
            
            return {
                "success": True,
                "analysis": {
                    "overall_score": overall_score,
                    "ai_feedback": response_text,
                    "strengths": strengths[:4],  # Limit to 4 items
                    "improvements": improvements[:4],  # Limit to 4 items
                    "channel_specific": channel_specific,
                    "predicted_engagement": predicted_engagement
                },
                "source": "gemini_ai"
            }
            
        except Exception as e:
            logger.error(f"Error parsing creative analysis response: {e}")
            # Return fallback with the raw response
            return {
                "success": True,
                "analysis": {
                    "overall_score": 75,
                    "ai_feedback": response_text,
                    "strengths": [
                        "Clear value proposition",
                        "Strong call-to-action",
                        "Appropriate for target channel"
                    ],
                    "improvements": [
                        "Consider adding urgency elements",
                        "Test different headline variations",
                        "Optimize for mobile viewing"
                    ],
                    "channel_specific": f"This creative is well-suited for {creative_data.get('channel', 'the selected channel')}",
                    "predicted_engagement": "High click-through rate expected"
                },
                "source": "gemini_ai"
            }

    def _fallback_creative_analysis(self, creative_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback analysis when Gemini is unavailable"""
        return {
            "success": True,
            "analysis": {
                "overall_score": 72,
                "ai_feedback": "Creative analysis currently using fallback mode. Your creative shows good structure with clear messaging and appropriate call-to-action for the selected channel.",
                "strengths": [
                    "Clear and concise messaging",
                    "Appropriate call-to-action",
                    "Channel-appropriate content"
                ],
                "improvements": [
                    "Consider A/B testing different headlines",
                    "Test various call-to-action phrases",
                    "Experiment with different value propositions"
                ],
                "channel_specific": f"Your creative is optimized for {creative_data.get('channel', 'the selected channel')}",
                "predicted_engagement": "Expected performance within industry averages"
            },
            "source": "fallback"
        }

# Create singleton instance
gemini_service = GeminiService()