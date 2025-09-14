import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path

# Try to import ML dependencies, fall back gracefully if not available
try:
    import numpy as np
    import pandas as pd
    import joblib
    ML_AVAILABLE = True
except ImportError as e:
    logging.warning(f"ML dependencies not available: {e}. Using fallback logic.")
    ML_AVAILABLE = False
    # Create mock objects for graceful fallback
    np = None
    pd = None
    joblib = None

from app.models.types import (
    MLCampaignOptimizationRequest, MLCampaignOptimizationResponse,
    MLCreativeScoreRequest, MLCreativeScoreResponse
)

logger = logging.getLogger(__name__)

# Global variables for models
campaign_model = None
feature_columns = None
nlp_models = {}

async def load_ml_models():
    """Load all ML models"""
    global campaign_model, feature_columns, nlp_models
    
    if not ML_AVAILABLE:
        logger.info("ML dependencies not available, skipping model loading")
        return
    
    # Load campaign optimization model
    try:
        models_path = Path("models")
        model_file = models_path / "campaign_optimizer_usd.pkl"
        features_file = models_path / "model_feature_columns_usd.json"
        
        if model_file.exists() and features_file.exists():
            campaign_model = joblib.load(str(model_file))
            with open(features_file, "r") as f:
                feature_columns = json.load(f)
            logger.info("Campaign optimization model loaded successfully")
        else:
            logger.warning(f"Campaign model files not found at {models_path}")
            logger.info(f"Expected files: {model_file}, {features_file}")
    except Exception as e:
        logger.error(f"Error loading campaign model: {e}")
    
    # Load NLP models
    try:
        # Import here to avoid loading on startup if not available
        from sentence_transformers import SentenceTransformer, util
        from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
        
        nlp_models['embedder'] = SentenceTransformer("all-MiniLM-L6-v2")
        
        # Load paraphraser with error handling
        try:
            PARAPHRASER_MODEL = "Vamsi/T5_Paraphrase_Paws"
            tokenizer = AutoTokenizer.from_pretrained(PARAPHRASER_MODEL)
            model_seq2seq = AutoModelForSeq2SeqLM.from_pretrained(PARAPHRASER_MODEL)
            nlp_models['paraphraser'] = pipeline("text2text-generation", 
                                               model=model_seq2seq, 
                                               tokenizer=tokenizer, 
                                               device=-1)
        except Exception as e:
            logger.warning(f"Could not load paraphraser model: {e}")
            nlp_models['paraphraser'] = None
        
        logger.info("NLP models loaded successfully")
    except Exception as e:
        logger.error(f"Error loading NLP models: {e}")

class MLService:
    
    @staticmethod
    def build_features_row(total_budget: float, split_budgets: Dict[str, float], 
                          aov: float, creative_quality: float, campaign_days: int,
                          target_margin: float, age: int, gender: str, income_level: str):
        """Build feature row for campaign model prediction"""
        channels = ["instagram", "google", "tiktok", "facebook", "youtube", "linkedin"]
        
        pct_vals = {f"pct_{ch}": (split_budgets[ch]/total_budget if total_budget > 0 else 0.0) 
                    for ch in channels}
        
        feat = {
            **{f"budget_{ch}": split_budgets[ch] for ch in channels},
            **pct_vals,
            "total_budget": float(total_budget),
            "aov": float(aov),
            "creative_quality": float(creative_quality),
            "campaign_days": int(campaign_days),
            "target_margin": float(target_margin),
            "age": int(age),
            "gender": gender,
            "income_level": income_level
        }
        
        df = pd.DataFrame([feat])
        df = pd.get_dummies(df, columns=["gender", "income_level"])
        
        # Ensure all columns are present
        for col in feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        return df[feature_columns]

    @staticmethod
    def generate_candidates(total_budget: float, channels: List[str], K: int = 500, seed: int = 42):
        """Generate candidate budget allocations"""
        if not ML_AVAILABLE or np is None:
            # Fallback: generate simple variations
            import random
            random.seed(seed)
            candidates = []
            for _ in range(min(K, 50)):  # Limit fallback candidates
                # Generate random splits
                splits = [random.random() for _ in channels]
                total = sum(splits)
                normalized = [s/total for s in splits]
                
                budgets = {ch: round(total_budget * frac, 2) for ch, frac in zip(channels, normalized)}
                # Adjust for rounding errors
                diff = round(total_budget - sum(budgets.values()), 2)
                if abs(diff) >= 0.01:
                    largest = max(budgets, key=budgets.get)
                    budgets[largest] = round(budgets[largest] + diff, 2)
                candidates.append(budgets)
            return candidates
        
        np.random.seed(seed)
        samples = np.random.dirichlet(np.ones(len(channels)), size=K)
        candidates = []
        
        for samp in samples:
            budgets = {ch: round(float(total_budget * frac), 2) for ch, frac in zip(channels, samp)}
            # Adjust for rounding errors
            diff = round(total_budget - sum(budgets.values()), 2)
            if abs(diff) >= 0.01:
                largest = max(budgets, key=budgets.get)
                budgets[largest] = round(budgets[largest] + diff, 2)
            candidates.append(budgets)
        
        return candidates

    @staticmethod
    async def optimize_campaign_budget(request: MLCampaignOptimizationRequest) -> MLCampaignOptimizationResponse:
        """Optimize campaign budget allocation"""
        global campaign_model, feature_columns
        
        # If ML is not available or model not loaded, use fallback logic
        if not ML_AVAILABLE or not campaign_model or not feature_columns:
            return await MLService._optimize_campaign_budget_fallback(request)
        
        channels = ["instagram", "google", "tiktok", "facebook", "youtube", "linkedin"]
        candidates = MLService.generate_candidates(request.total_budget, channels, K=500)
        
        # Score all candidates
        scored = []
        for cand in candidates:
            try:
                feat_row = MLService.build_features_row(
                    request.total_budget, cand, request.aov, request.creative_quality,
                    request.campaign_days, request.target_margin, request.age, 
                    request.gender, request.income_level
                )
                pred_rev = float(campaign_model.predict(feat_row)[0])
                pred_roi = (pred_rev - request.total_budget) / request.total_budget if request.total_budget > 0 else -9999
                
                scored.append({
                    "split": cand,
                    "pred_revenue": pred_rev,
                    "pred_roi": pred_roi
                })
            except Exception as e:
                logger.warning(f"Error scoring candidate: {e}")
                continue
        
        if not scored:
            return await MLService._optimize_campaign_budget_fallback(request)
        
        # Get best candidate
        best = max(scored, key=lambda x: x["pred_roi"])
        
        # Calculate confidence based on variance in top predictions
        top_5_rois = sorted([s["pred_roi"] for s in scored], reverse=True)[:5]
        confidence = max(0.5, 1.0 - (np.std(top_5_rois) * 2))
        
        warning = None
        if best["pred_roi"] < 0:
            warning = "⚠️ Model predicts this campaign may be unprofitable under given inputs."
        
        return MLCampaignOptimizationResponse(
            recommended_split=best["split"],
            predicted_revenue=round(best["pred_revenue"], 2),
            predicted_roi=max(0.0, round(best["pred_roi"], 4)),
            confidence_score=round(confidence, 2),
            warning=warning
        )

    @staticmethod
    def semantic_score(text: str, reference_list: List[str]) -> float:
        """Calculate semantic similarity score"""
        global nlp_models
        
        if not text.strip() or not nlp_models.get('embedder'):
            return 0.0
        
        try:
            embeddings = nlp_models['embedder'].encode([text] + reference_list, convert_to_tensor=True)
            from sentence_transformers import util
            sim = util.cos_sim(embeddings[0], embeddings[1:]).cpu().numpy()
            return float(np.max(sim))
        except Exception as e:
            logger.warning(f"Error calculating semantic score: {e}")
            return 0.0

    @staticmethod
    async def score_creative_content(request: MLCreativeScoreRequest) -> MLCreativeScoreResponse:
        """Score creative content using NLP models"""
        # If ML is not available, use fallback logic
        if not ML_AVAILABLE or not nlp_models.get('embedder'):
            return await MLService._score_creative_content_fallback(request)
            
        # Reference lists
        strong_ctas = ["Buy Now", "Shop Now", "Learn More", "Sign Up", "Get Started", "Join Now", "Subscribe"]
        engaging_phrases = ["limited time offer", "exclusive deal", "save big today", "🔥 hot sale", "best choice for you"]
        
        # Score components
        title_length = len(request.title.split())
        title_length_score = 0.7 if 5 <= title_length <= 10 else 0.3
        title_engagement = MLService.semantic_score(request.title, engaging_phrases)
        title_score = round((title_length_score + title_engagement) * 5, 2)
        
        desc_length = len(request.description.split())
        desc_length_score = 0.7 if 15 <= desc_length <= 30 else 0.3
        desc_cta_score = MLService.semantic_score(request.description, strong_ctas)
        desc_engage_score = MLService.semantic_score(request.description, engaging_phrases)
        channel_bonus = 0.7 if request.channel.lower() in ["instagram", "tiktok"] and "🔥" in request.description else 0.5
        desc_score = round((desc_length_score + desc_cta_score + desc_engage_score + channel_bonus) * 2.5, 2)
        
        cta_score = round(MLService.semantic_score(request.cta, strong_ctas) * 10, 2)
        
        channel_fit = np.mean([title_score, desc_score])
        final_score = round((title_score + desc_score + cta_score + channel_fit) / 4, 2)
        
        # Generate feedback and improvements
        feedback = []
        improvements = {}
        
        if title_score < 7:
            feedback.append("Headline could be more engaging - try adding urgency or emotional triggers")
            improvements["title"] = MLService.generate_title_improvements(request.title, request.channel)
        
        if desc_score < 7:
            feedback.append("Description needs stronger call-to-action or more compelling benefits")
            improvements["description"] = MLService.generate_description_improvements(request.description, request.channel)
        
        if cta_score < 7:
            feedback.append("Call-to-action could be more action-oriented and specific")
            improvements["cta"] = MLService.generate_cta_improvements(request.cta, request.channel)
        
        return MLCreativeScoreResponse(
            channel=request.channel,
            scores={
                "title": title_score,
                "description": desc_score,
                "cta": cta_score,
                "channel_fit": round(channel_fit, 2),
                "final": final_score
            },
            feedback=feedback,
            improvements=improvements
        )

    @staticmethod
    def generate_title_improvements(title: str, channel: str) -> List[str]:
        """Generate title improvement suggestions"""
        improvements = []
        
        if channel.lower() == "google":
            improvements.extend([
                f"{title} | 50% Off",
                f"{title} - Best Deals",
                f"Official {title} Store"
            ])
        elif channel.lower() in ["instagram", "tiktok"]:
            improvements.extend([
                f"🔥 {title} - Limited Time!",
                f"{title} 😍 Don't Miss Out!",
                f"VIRAL: {title} Everyone's Talking About"
            ])
        elif channel.lower() == "linkedin":
            improvements.extend([
                f"{title} - Professional Solutions",
                f"Discover {title} for Business Growth",
                f"Industry-Leading {title}"
            ])
        else:
            improvements.extend([
                f"{title} - Shop Now & Save",
                f"Premium {title} Collection",
                f"{title} - Limited Stock Available"
            ])
        
        return improvements[:3]

    @staticmethod
    def generate_description_improvements(description: str, channel: str) -> List[str]:
        """Generate description improvement suggestions"""
        improvements = []
        
        if channel.lower() == "google":
            improvements.extend([
                f"{description} Order now with fast, free shipping.",
                f"{description} Save more today with exclusive deals.",
                f"{description} Limited time offer - shop now!"
            ])
        elif channel.lower() in ["instagram", "tiktok"]:
            improvements.extend([
                f"{description} Hurry, limited stock! 🔥",
                f"{description} Shop now and get yours! 😍",
                f"{description} Join thousands of happy customers! ✨"
            ])
        elif channel.lower() == "linkedin":
            improvements.extend([
                f"{description} Drive business growth and efficiency.",
                f"{description} Contact us for enterprise solutions.",
                f"{description} Trusted by industry leaders worldwide."
            ])
        else:
            improvements.extend([
                f"{description} Buy now and save big!",
                f"{description} Explore our full collection today.",
                f"{description} Don't wait - limited time only!"
            ])
        
        return improvements[:3]

    @staticmethod
    def generate_cta_improvements(cta: str, channel: str) -> List[str]:
        """Generate CTA improvement suggestions"""
        if channel.lower() == "google":
            return ["Shop Now", "Buy Today", "Learn More", "Get Quote"]
        elif channel.lower() in ["instagram", "tiktok"]:
            return ["Shop Now 🛍️", "Get Yours!", "Swipe Up", "Link in Bio"]
        elif channel.lower() == "linkedin":
            return ["Learn More", "Contact Us", "Get Started", "Request Demo"]
        else:
            return ["Shop Now", "Buy Now", "Get Started", "Learn More"]

    @staticmethod
    async def _optimize_campaign_budget_fallback(request: MLCampaignOptimizationRequest) -> MLCampaignOptimizationResponse:
        """Fallback optimization using rule-based logic"""
        logger.info("Using fallback campaign optimization logic")
        
        # Simple rule-based budget allocation
        channels = ["instagram", "google", "tiktok", "facebook", "youtube", "linkedin"]
        
        # Base allocation weights based on general performance
        weights = {
            "google": 0.3,      # High intent traffic
            "facebook": 0.25,   # Good reach and targeting
            "instagram": 0.2,   # Visual products
            "youtube": 0.15,    # Video content
            "linkedin": 0.05,   # B2B
            "tiktok": 0.05      # Younger demographics
        }
        
        # Adjust weights based on target demographics
        if request.age < 30:
            weights["tiktok"] += 0.1
            weights["instagram"] += 0.1
            weights["facebook"] -= 0.1
            weights["google"] -= 0.1
        
        # Apply budget allocation
        recommended_split = {}
        for channel in channels:
            recommended_split[channel] = round(request.total_budget * weights.get(channel, 0), 2)
        
        # Simple revenue prediction (2.5x multiplier)
        predicted_revenue = request.total_budget * 2.5
        predicted_roi = 1.5  # 150% ROI
        
        return MLCampaignOptimizationResponse(
            recommended_split=recommended_split,
            predicted_revenue=predicted_revenue,
            predicted_roi=predicted_roi,
            confidence_score=0.6,  # Lower confidence for fallback
            warning="Using rule-based optimization (ML models not available)"
        )
    
    @staticmethod
    async def _score_creative_content_fallback(request: MLCreativeScoreRequest) -> MLCreativeScoreResponse:
        """Fallback creative scoring using simple rules"""
        logger.info("Using fallback creative scoring logic")
        
        # Simple rule-based scoring
        title_score = min(10, max(1, len(request.title.split()) * 1.5))
        desc_score = min(10, max(1, len(request.description.split()) * 0.5))
        cta_score = 8.0 if any(word in request.cta.lower() for word in ["buy", "shop", "get", "try"]) else 5.0
        
        return MLCreativeScoreResponse(
            channel=request.channel,
            scores={
                "title": title_score,
                "description": desc_score,
                "cta": cta_score,
                "channel_fit": 7.0,
                "final": round((title_score + desc_score + cta_score + 7.0) / 4, 1)
            },
            improvements={
                "title": [f"{request.title} - Limited Time Offer!"],
                "description": [f"{request.description} Shop now and save!"],
                "cta": ["Shop Now", "Get Yours Today"]
            }
        )

    @staticmethod
    async def health_check() -> Dict[str, Any]:
        """Check ML service health"""
        return {
            "ml_dependencies_available": ML_AVAILABLE,
            "campaign_model_loaded": campaign_model is not None,
            "feature_columns_loaded": feature_columns is not None,
            "nlp_embedder_loaded": nlp_models.get('embedder') is not None,
            "nlp_paraphraser_loaded": nlp_models.get('paraphraser') is not None,
            "models_loaded": campaign_model is not None and len(nlp_models) > 0,
            "fallback_mode": not ML_AVAILABLE or campaign_model is None
        }