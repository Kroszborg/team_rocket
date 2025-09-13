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
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    from sentence_transformers import SentenceTransformer, util
    ML_AVAILABLE = True
except ImportError as e:
    logging.warning(f"ML dependencies not available: {e}. Using fallback logic.")
    ML_AVAILABLE = False
    # Create mock objects for graceful fallback
    np = None
    pd = None
    joblib = None
    torch = None

from app.models.types import (
    MLCampaignOptimizationRequest, MLCampaignOptimizationResponse,
    MLCreativeScoreRequest, MLCreativeScoreResponse
)

logger = logging.getLogger(__name__)

# Global variables for models
campaign_model = None
feature_columns = None
nlp_models = {}
distilbert_model = None
distilbert_tokenizer = None

# Label mapping for DistilBERT (from README.txt)
DISTILBERT_LABEL_MAPPING = {0: 3, 1: 4, 2: 5, 3: 6, 4: 7, 5: 8}

async def load_ml_models():
    """Load all ML models"""
    global campaign_model, feature_columns, nlp_models, distilbert_model, distilbert_tokenizer

    if not ML_AVAILABLE:
        logger.info("ML dependencies not available, skipping model loading")
        return

    logger.info("Starting ML model loading...")

    # Load campaign optimization model
    try:
        models_path = Path("models")
        model_file = models_path / "campaign_optimizer_usd.pkl"
        features_file = models_path / "model_feature_columns_usd.json"

        if model_file.exists() and features_file.exists():
            campaign_model = joblib.load(str(model_file))
            with open(features_file, "r") as f:
                feature_columns = json.load(f)
            logger.info("✅ Campaign optimization model loaded successfully")
        else:
            logger.warning(f"❌ Campaign model files not found at {models_path}")
            logger.info(f"Expected files: {model_file}, {features_file}")
    except Exception as e:
        logger.error(f"❌ Error loading campaign model: {e}")

    # Load DistilBERT creative scoring model
    try:
        distilbert_path = Path("models/distilbert_creative_scorer")
        if distilbert_path.exists():
            distilbert_tokenizer = AutoTokenizer.from_pretrained(str(distilbert_path))
            distilbert_model = AutoModelForSequenceClassification.from_pretrained(str(distilbert_path))
            distilbert_model.eval()
            logger.info("✅ DistilBERT creative scoring model loaded successfully")
        else:
            logger.warning(f"❌ DistilBERT model not found at {distilbert_path}")
    except Exception as e:
        logger.error(f"❌ Error loading DistilBERT model: {e}")

    # Load NLP models for semantic analysis
    try:
        # Sentence embedder for semantic similarity
        nlp_models['embedder'] = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("✅ Sentence embedder loaded successfully")

        # Skip paraphraser for now to speed up loading
        logger.info("⏭️ Skipping paraphraser model to speed up loading")

    except Exception as e:
        logger.error(f"❌ Error loading NLP models: {e}")

    # Log final status
    models_loaded = []
    if campaign_model is not None:
        models_loaded.append("Campaign Optimizer")
    if distilbert_model is not None:
        models_loaded.append("DistilBERT Creative Scorer")
    if nlp_models.get('embedder') is not None:
        models_loaded.append("Sentence Embedder")

    logger.info(f"🎉 ML models loaded: {', '.join(models_loaded) if models_loaded else 'None'}")

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

        try:
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
        except Exception as e:
            logger.error(f"Error in campaign optimization: {e}")
            return await MLService._optimize_campaign_budget_fallback(request)

    @staticmethod
    async def score_creative_content(request: MLCreativeScoreRequest) -> MLCreativeScoreResponse:
        """Score creative content using DistilBERT and NLP models"""
        global distilbert_model, distilbert_tokenizer

        # If DistilBERT model is not available, use fallback
        if not ML_AVAILABLE or not distilbert_model or not distilbert_tokenizer:
            return await MLService._score_creative_content_fallback(request)

        try:
            # Combine title and description for DistilBERT scoring
            combined_text = f"{request.title}. {request.description}. {request.cta}"

            # Get DistilBERT prediction
            inputs = distilbert_tokenizer(combined_text, truncation=True, padding=True, return_tensors="pt")
            with torch.no_grad():
                outputs = distilbert_model(**inputs)
                probs = torch.softmax(outputs.logits, dim=-1).tolist()[0]

            # Convert probabilities to score (3-8 scale)
            expected_score = sum(DISTILBERT_LABEL_MAPPING[i] * prob for i, prob in enumerate(probs))
            distilbert_score = min(10, max(1, expected_score * 1.25))  # Scale to 1-10

            # Enhance with semantic analysis if available
            semantic_boost = 0
            if nlp_models.get('embedder'):
                try:
                    # Reference phrases for good marketing copy
                    good_marketing_phrases = [
                        "limited time offer", "exclusive deal", "act now", "save money",
                        "premium quality", "satisfaction guaranteed", "free shipping",
                        "best value", "top rated", "customer favorite"
                    ]

                    embeddings = nlp_models['embedder'].encode([combined_text] + good_marketing_phrases, convert_to_tensor=True)
                    similarities = util.cos_sim(embeddings[0], embeddings[1:]).cpu().numpy()
                    semantic_boost = float(np.max(similarities)) * 2  # Boost up to 2 points
                except Exception as e:
                    logger.warning(f"Error in semantic analysis: {e}")

            # Final score calculation
            final_score = min(10, max(1, distilbert_score + semantic_boost))

            # Component scores (more granular breakdown)
            title_score = min(10, max(1, len(request.title.split()) * 1.2 + semantic_boost))
            desc_score = min(10, max(1, len(request.description.split()) * 0.6 + distilbert_score * 0.3))
            cta_score = 8.0 if any(word in request.cta.lower() for word in ["buy", "shop", "get", "try", "now"]) else 6.0
            channel_fit = distilbert_score * 0.8  # DistilBERT considers overall quality

            # Generate feedback based on scores
            feedback = []
            improvements = {}

            if title_score < 7:
                feedback.append("Title could be more engaging - try adding urgency or emotional triggers")
                improvements["title"] = MLService.generate_title_improvements(request.title, request.channel)

            if desc_score < 7:
                feedback.append("Description needs stronger call-to-action or more compelling benefits")
                improvements["description"] = MLService.generate_description_improvements(request.description, request.channel)

            if cta_score < 7:
                feedback.append("Call-to-action could be more action-oriented and specific")
                improvements["cta"] = MLService.generate_cta_improvements(request.cta, request.channel)

            if final_score >= 8:
                feedback.append("🎉 Excellent creative! This should perform very well.")
            elif final_score >= 6:
                feedback.append("Good creative with room for improvement.")
            else:
                feedback.append("Creative needs significant improvements for better performance.")

            return MLCreativeScoreResponse(
                channel=request.channel,
                scores={
                    "title": round(title_score, 1),
                    "description": round(desc_score, 1),
                    "cta": round(cta_score, 1),
                    "channel_fit": round(channel_fit, 1),
                    "final": round(final_score, 1)
                },
                feedback=feedback,
                improvements=improvements
            )

        except Exception as e:
            logger.error(f"Error in DistilBERT creative scoring: {e}")
            return await MLService._score_creative_content_fallback(request)

    @staticmethod
    def generate_title_improvements(title: str, channel: str) -> List[str]:
        """Generate title improvement suggestions"""
        improvements = []

        if channel.lower() == "google":
            improvements.extend([
                f"{title} | 50% Off Today",
                f"Best {title} Deals 2024",
                f"Official {title} - Free Shipping"
            ])
        elif channel.lower() in ["instagram", "tiktok"]:
            improvements.extend([
                f"🔥 {title} - Limited Time!",
                f"{title} 😍 Don't Miss Out!",
                f"VIRAL: {title} Everyone Loves ✨"
            ])
        elif channel.lower() == "linkedin":
            improvements.extend([
                f"{title} - Professional Solutions",
                f"Industry-Leading {title} for Business",
                f"Boost ROI with {title}"
            ])
        else:
            improvements.extend([
                f"{title} - Shop Now & Save Big",
                f"Premium {title} Collection",
                f"Limited Stock: {title} Available"
            ])

        return improvements[:3]

    @staticmethod
    def generate_description_improvements(description: str, channel: str) -> List[str]:
        """Generate description improvement suggestions"""
        improvements = []
        base_desc = description[:100] + "..." if len(description) > 100 else description

        if channel.lower() == "google":
            improvements.extend([
                f"{base_desc} Order now with fast, free shipping and 30-day guarantee!",
                f"{base_desc} Save big today with our exclusive deals - limited time only!",
                f"{base_desc} Join thousands of satisfied customers - shop now!"
            ])
        elif channel.lower() in ["instagram", "tiktok"]:
            improvements.extend([
                f"{base_desc} Hurry, limited stock! 🔥 Swipe up to get yours!",
                f"{base_desc} 😍 Join the trend - link in bio! ✨",
                f"{base_desc} Going viral! Get yours before they sell out! 🚀"
            ])
        elif channel.lower() == "linkedin":
            improvements.extend([
                f"{base_desc} Drive measurable business growth and ROI.",
                f"{base_desc} Trusted by 500+ enterprise clients worldwide.",
                f"{base_desc} Schedule a demo to see the impact on your business."
            ])
        else:
            improvements.extend([
                f"{base_desc} Buy now and save big with free shipping!",
                f"{base_desc} Explore our full collection - satisfaction guaranteed!",
                f"{base_desc} Don't wait - limited time offer ending soon!"
            ])

        return improvements[:2]

    @staticmethod
    def generate_cta_improvements(cta: str, channel: str) -> List[str]:
        """Generate CTA improvement suggestions"""
        if channel.lower() == "google":
            return ["Shop Now & Save", "Buy Today - Free Shipping", "Get Best Price", "Order Now"]
        elif channel.lower() in ["instagram", "tiktok"]:
            return ["Swipe Up 🔥", "Get Yours! 😍", "Shop Now ✨", "Link in Bio 👆"]
        elif channel.lower() == "linkedin":
            return ["Schedule Demo", "Get Enterprise Quote", "Learn More", "Contact Sales"]
        else:
            return ["Shop Now", "Buy Now & Save", "Get Yours Today", "Order Now"]

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
            warning="Using rule-based optimization (Campaign ML model not available)"
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
            feedback=["Using rule-based scoring (DistilBERT model not available)"],
            improvements={
                "title": [f"{request.title} - Limited Time Offer!"],
                "description": [f"{request.description} Shop now and save!"],
                "cta": ["Shop Now", "Get Yours Today", "Buy Now"]
            }
        )

    @staticmethod
    async def health_check() -> Dict[str, Any]:
        """Check ML service health"""
        return {
            "ml_dependencies_available": ML_AVAILABLE,
            "campaign_model_loaded": campaign_model is not None,
            "feature_columns_loaded": feature_columns is not None,
            "distilbert_model_loaded": distilbert_model is not None,
            "nlp_embedder_loaded": nlp_models.get('embedder') is not None,
            "nlp_paraphraser_loaded": nlp_models.get('paraphraser') is not None,
            "models_loaded": (campaign_model is not None and distilbert_model is not None),
            "fallback_mode": not ML_AVAILABLE or campaign_model is None or distilbert_model is None
        }