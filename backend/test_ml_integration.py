#!/usr/bin/env python3
"""
Test script to verify ML model integration
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ml_service import load_ml_models, MLService
from app.models.types import MLCampaignOptimizationRequest, MLCreativeScoreRequest

async def test_model_loading():
    """Test that all models load correctly"""
    print("🔄 Testing ML model loading...")

    await load_ml_models()

    # Check health
    health = await MLService.health_check()
    print("\n📊 ML Health Status:")
    for key, value in health.items():
        status = "✅" if value else "❌"
        print(f"   {key}: {status} {value}")

    return health["models_loaded"]

async def test_campaign_optimization():
    """Test campaign optimization"""
    print("\n🎯 Testing Campaign Optimization...")

    request = MLCampaignOptimizationRequest(
        total_budget=1000.0,
        aov=50.0,
        age=28,
        gender="man",
        income_level="high",
        creative_quality=0.7,
        campaign_days=30,
        target_margin=0.25
    )

    try:
        response = await MLService.optimize_campaign_budget(request)
        print(f"   ✅ Predicted Revenue: ${response.predicted_revenue}")
        print(f"   ✅ Predicted ROI: {response.predicted_roi*100:.1f}%")
        print(f"   ✅ Confidence: {response.confidence_score*100:.1f}%")

        if response.warning:
            print(f"   ⚠️  Warning: {response.warning}")

        print(f"   📊 Budget Split:")
        for channel, amount in response.recommended_split.items():
            if amount > 0:
                print(f"      {channel}: ${amount}")

        return True
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

async def test_creative_scoring():
    """Test creative scoring with DistilBERT"""
    print("\n📝 Testing Creative Scoring (DistilBERT)...")

    request = MLCreativeScoreRequest(
        channel="facebook",
        title="Amazing New Product - Limited Time Offer!",
        description="Revolutionary technology that will change your life. Get yours now with 50% off and free shipping!",
        cta="Shop Now"
    )

    try:
        response = await MLService.score_creative_content(request)
        print(f"   ✅ Overall Score: {response.scores['final']}/10")
        print(f"   📊 Breakdown:")
        print(f"      Title: {response.scores['title']}/10")
        print(f"      Description: {response.scores['description']}/10")
        print(f"      CTA: {response.scores['cta']}/10")
        print(f"      Channel Fit: {response.scores['channel_fit']}/10")

        if response.feedback:
            print(f"   💡 Feedback:")
            for feedback in response.feedback[:3]:
                print(f"      - {feedback}")

        return True
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

async def test_different_creative_examples():
    """Test various creative examples"""
    print("\n🧪 Testing Various Creative Examples...")

    examples = [
        {
            "name": "High-quality ad",
            "request": MLCreativeScoreRequest(
                channel="instagram",
                title="🔥 Premium Wireless Earbuds - 50% Off Today Only!",
                description="Experience crystal-clear sound with our award-winning wireless earbuds. Limited stock - order now and get free shipping! ✨",
                cta="Get Yours Now! 🛍️"
            )
        },
        {
            "name": "Poor-quality ad",
            "request": MLCreativeScoreRequest(
                channel="facebook",
                title="Product",
                description="Good product for sale.",
                cta="Click"
            )
        },
        {
            "name": "LinkedIn professional ad",
            "request": MLCreativeScoreRequest(
                channel="linkedin",
                title="Boost Your Team's Productivity with Enterprise Software",
                description="Streamline operations and increase efficiency by 40%. Trusted by 500+ companies worldwide. Schedule a demo to see the ROI impact.",
                cta="Request Demo"
            )
        }
    ]

    for example in examples:
        print(f"\n   📋 Testing: {example['name']}")
        try:
            response = await MLService.score_creative_content(example['request'])
            score = response.scores['final']
            print(f"      Score: {score}/10 ({'Good' if score >= 7 else 'Needs Improvement' if score >= 5 else 'Poor'})")

            if response.feedback:
                print(f"      Feedback: {response.feedback[0]}")

        except Exception as e:
            print(f"      ❌ Error: {e}")

async def main():
    """Run all tests"""
    print("🚀 ML Integration Test Suite")
    print("=" * 50)

    # Test model loading
    models_loaded = await test_model_loading()

    if not models_loaded:
        print("\n⚠️  Models not fully loaded, but testing basic functionality...")

    # Test campaign optimization
    await test_campaign_optimization()

    # Test creative scoring
    await test_creative_scoring()

    # Test various examples
    await test_different_creative_examples()

    print("\n🎉 ML Integration testing completed!")
    print("\nNext steps:")
    print("1. Start the backend: python main.py")
    print("2. Check health at: http://localhost:8000/api/ml/health")
    print("3. Test creative scoring at: http://localhost:8000/docs")

if __name__ == "__main__":
    asyncio.run(main())