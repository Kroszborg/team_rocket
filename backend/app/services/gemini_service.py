import os
import asyncio
import logging
from typing import Dict, List, Optional, Any
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.client = None
        self.model_name = "gemini-1.5-pro"
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Gemini client"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found. Gemini features will be disabled.")
            return
        
        try:
            genai.configure(api_key=api_key)
            self.client = genai.GenerativeModel(self.model_name)
            logger.info("Gemini client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
    
    async def _generate_content(self, prompt: str, max_retries: int = 3) -> Optional[str]:
        """Generate content with retry logic"""
        if not self.client:
            return None
        
        for attempt in range(max_retries):
            try:
                response = await asyncio.to_thread(
                    self.client.generate_content,
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=2000,
                        top_p=0.9,
                    )
                )
                return response.text
            except Exception as e:
                logger.warning(f"Gemini API attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
        
        return None

    async def analyze_campaign_strategy(self, campaign_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Generate strategic campaign analysis"""
        prompt = f"""
        You are an expert marketing strategist with 15 years of experience across all digital channels.
        
        Analyze this campaign and provide strategic insights:
        
        **Campaign Details:**
        - Product: {campaign_data.get('product', {}).get('name', 'Unknown')} ({campaign_data.get('product', {}).get('category', 'Unknown')})
        - Price: ${campaign_data.get('product', {}).get('price', 0)}
        - Budget: ${campaign_data.get('budget', {}).get('total', 0)} over {campaign_data.get('budget', {}).get('duration', 0)} days
        - Target Audience: Ages {campaign_data.get('targeting', {}).get('age_range', {}).get('min', 0)}-{campaign_data.get('targeting', {}).get('age_range', {}).get('max', 0)}, {campaign_data.get('targeting', {}).get('gender', 'All')}, {campaign_data.get('targeting', {}).get('income', 'All')} income
        - Interests: {', '.join(campaign_data.get('targeting', {}).get('interests', []))}
        - Preferred Channels: {', '.join(campaign_data.get('channels', {}).get('preferred', []))}
        
        Provide a structured analysis in JSON format:
        {{
            "market_opportunity": "Analysis of market size and opportunity",
            "competitive_landscape": "Key competitors and positioning strategy",
            "audience_insights": "Deep insights about the target audience",
            "channel_strategy": "Why the chosen channels are optimal/suboptimal",
            "timing_analysis": "Best timing and seasonality considerations",
            "risk_factors": ["List of potential risks"],
            "success_metrics": ["Key metrics to track"],
            "recommendations": ["3-5 strategic recommendations"],
            "confidence_score": 0.85
        }}
        """
        
        try:
            response = await self._generate_content(prompt)
            if response:
                # Try to extract JSON from response
                import json
                import re
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                else:
                    # Fallback: return as plain text
                    return {"analysis": response, "confidence_score": 0.7}
        except Exception as e:
            logger.error(f"Error analyzing campaign strategy: {e}")
        
        return None

    async def generate_creative_concepts(self, product_name: str, category: str, 
                                       audience: str, channel: str, count: int = 5) -> List[Dict[str, Any]]:
        """Generate creative advertising concepts"""
        prompt = f"""
        You are a creative director at a top advertising agency.
        
        Generate {count} innovative advertising concepts for:
        
        **Product:** {product_name}
        **Category:** {category}
        **Audience:** {audience}
        **Channel:** {channel}
        
        For each concept, provide:
        
        1. **Hook/Angle:** The main creative angle
        2. **Visual Concept:** Description of imagery/video
        3. **Copy Direction:** Tone and messaging approach
        4. **Emotional Trigger:** What emotion does it target
        5. **Call-to-Action:** Specific CTA recommendation
        6. **Why It Works:** Psychological/strategic reasoning
        7. **Execution Tips:** How to bring it to life
        
        Format as JSON array:
        [
            {{
                "concept_name": "Concept 1 Title",
                "hook": "Main angle",
                "visual": "Visual description",
                "copy_tone": "Tone description",
                "emotion": "Target emotion",
                "cta": "Call to action",
                "rationale": "Why it works",
                "execution": "How to execute",
                "creativity_score": 0.9
            }}
        ]
        """
        
        try:
            response = await self._generate_content(prompt)
            if response:
                import json
                import re
                json_match = re.search(r'\[.*\]', response, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                else:
                    # Fallback: parse as text
                    concepts = []
                    lines = response.split('\n')
                    current_concept = {}
                    for line in lines:
                        if 'Concept' in line and ':' in line:
                            if current_concept:
                                concepts.append(current_concept)
                            current_concept = {"concept_name": line.split(':', 1)[1].strip()}
                        elif current_concept and ':' in line:
                            key, value = line.split(':', 1)
                            current_concept[key.lower().replace(' ', '_')] = value.strip()
                    if current_concept:
                        concepts.append(current_concept)
                    return concepts
        except Exception as e:
            logger.error(f"Error generating creative concepts: {e}")
        
        return []

    async def analyze_campaign_results(self, campaign_data: Dict[str, Any], 
                                     results: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Analyze campaign performance and provide insights"""
        prompt = f"""
        You are a performance marketing analyst with deep expertise in campaign optimization.
        
        Analyze this campaign's performance and provide actionable insights:
        
        **Campaign:**
        {campaign_data}
        
        **Results:**
        {results}
        
        Provide analysis in JSON format:
        {{
            "overall_performance": "High-level performance assessment",
            "key_winners": ["What performed exceptionally well"],
            "key_losers": ["What underperformed"],
            "channel_analysis": {{
                "best_performing": "Channel with best ROI and why",
                "worst_performing": "Channel with worst ROI and why",
                "optimization_opportunities": ["Channel-specific optimizations"]
            }},
            "audience_insights": "What the results tell us about the audience",
            "external_factors": ["Market/seasonal factors that may have influenced results"],
            "immediate_actions": ["3-5 actions to take right now"],
            "future_opportunities": ["Long-term strategic opportunities"],
            "scaling_recommendations": "How to scale what's working",
            "confidence_score": 0.9
        }}
        """
        
        try:
            response = await self._generate_content(prompt)
            if response:
                import json
                import re
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                else:
                    return {"analysis": response, "confidence_score": 0.7}
        except Exception as e:
            logger.error(f"Error analyzing campaign results: {e}")
        
        return None

    async def optimize_ad_copy(self, original_copy: Dict[str, str], 
                             performance_data: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Generate optimized versions of ad copy"""
        performance_context = ""
        if performance_data:
            performance_context = f"\nCurrent performance: CTR {performance_data.get('ctr', 0):.2%}, CVR {performance_data.get('cvr', 0):.2%}"
        
        prompt = f"""
        You are a direct response copywriter who has generated millions in ad revenue.
        
        Optimize this ad copy for better performance:
        
        **Original Copy:**
        - Headline: {original_copy.get('title', '')}
        - Description: {original_copy.get('description', '')}
        - CTA: {original_copy.get('cta', '')}
        - Channel: {original_copy.get('channel', '')}
        {performance_context}
        
        Generate 5 optimized versions focusing on:
        1. Higher click-through rates
        2. Better conversion rates
        3. Emotional triggers
        4. Urgency/scarcity
        5. Social proof
        
        Format as JSON:
        [
            {{
                "version": 1,
                "optimization_focus": "CTR improvement",
                "headline": "New headline",
                "description": "New description", 
                "cta": "New CTA",
                "rationale": "Why this should perform better",
                "expected_improvement": "CTR +15%"
            }}
        ]
        """
        
        try:
            response = await self._generate_content(prompt)
            if response:
                import json
                import re
                json_match = re.search(r'\[.*\]', response, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
        except Exception as e:
            logger.error(f"Error optimizing ad copy: {e}")
        
        return []

    async def generate_audience_insights(self, campaign_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Generate deep audience insights and recommendations"""
        prompt = f"""
        You are a consumer psychologist and audience research expert.
        
        Analyze this target audience and provide deep insights:
        
        **Audience Profile:**
        - Age: {campaign_data.get('targeting', {}).get('age_range', {})}
        - Gender: {campaign_data.get('targeting', {}).get('gender', 'All')}
        - Income: {campaign_data.get('targeting', {}).get('income', 'All')}
        - Interests: {campaign_data.get('targeting', {}).get('interests', [])}
        - Product: {campaign_data.get('product', {}).get('name', '')} ({campaign_data.get('product', {}).get('category', '')})
        
        Provide insights in JSON format:
        {{
            "psychographic_profile": "Deep psychological profile of this audience",
            "pain_points": ["Key problems they face"],
            "motivations": ["What drives their purchasing decisions"],
            "media_consumption": "Where and how they consume content",
            "messaging_angles": ["Effective messaging approaches"],
            "timing_preferences": "Best times/days to reach them",
            "channel_preferences": ["Ranked channels by effectiveness"],
            "competitor_analysis": "How competitors target this audience",
            "untapped_opportunities": ["Audience segments being overlooked"],
            "seasonal_trends": "How their behavior changes seasonally"
        }}
        """
        
        try:
            response = await self._generate_content(prompt)
            if response:
                import json
                import re
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
        except Exception as e:
            logger.error(f"Error generating audience insights: {e}")
        
        return None

    async def predict_market_trends(self, category: str, timeframe: str = "next 6 months") -> Optional[Dict[str, Any]]:
        """Predict market trends and opportunities"""
        prompt = f"""
        You are a market research analyst with access to current market data and trends.
        
        Analyze market trends and predict opportunities for the {category} category over the {timeframe}.
        
        Provide predictions in JSON format:
        {{
            "market_outlook": "Overall market direction",
            "emerging_trends": ["Key trends to watch"],
            "consumer_behavior_shifts": ["How consumer behavior is changing"],
            "technology_impact": "How technology will affect this market",
            "seasonal_patterns": "Seasonal opportunities and challenges",
            "competitive_landscape": "Changes in competition",
            "advertising_opportunities": ["New advertising opportunities"],
            "risk_factors": ["Potential market risks"],
            "recommendations": ["Strategic recommendations"],
            "confidence_level": 0.8
        }}
        """
        
        try:
            response = await self._generate_content(prompt)
            if response:
                import json
                import re
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
        except Exception as e:
            logger.error(f"Error predicting market trends: {e}")
        
        return None

    async def health_check(self) -> Dict[str, Any]:
        """Check if Gemini service is healthy"""
        if not self.client:
            return {
                "status": "unavailable",
                "reason": "No API key configured",
                "features_available": False
            }
        
        try:
            # Test with a simple prompt
            test_response = await self._generate_content("Hello! Just testing the connection. Reply with 'OK'.")
            if test_response and "OK" in test_response:
                return {
                    "status": "healthy",
                    "model": self.model_name,
                    "features_available": True
                }
            else:
                return {
                    "status": "degraded", 
                    "reason": "API responding but with issues",
                    "features_available": False
                }
        except Exception as e:
            return {
                "status": "error",
                "reason": str(e),
                "features_available": False
            }

# Global instance
gemini_service = GeminiService()