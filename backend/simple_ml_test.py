#!/usr/bin/env python3
"""
Simple test script to verify ML model integration
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_imports():
    """Test that ML dependencies are available"""
    print("Testing ML dependencies...")

    try:
        import numpy as np
        import pandas as pd
        import torch
        import transformers
        from sentence_transformers import SentenceTransformer
        print("✓ All ML dependencies imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False

async def test_model_loading():
    """Test loading ML models"""
    print("\nTesting model loading...")

    try:
        from app.services.ml_service import load_ml_models, MLService

        # Load models
        await load_ml_models()

        # Check health
        health = await MLService.health_check()

        print("Model Status:")
        for key, value in health.items():
            status = "OK" if value else "FAIL"
            print(f"  {key}: {status}")

        return health["models_loaded"]
    except Exception as e:
        print(f"✗ Model loading error: {e}")
        return False

async def test_creative_scoring():
    """Test creative scoring"""
    print("\nTesting creative scoring...")

    try:
        from app.services.ml_service import MLService
        from app.models.types import MLCreativeScoreRequest

        request = MLCreativeScoreRequest(
            channel="facebook",
            title="Amazing Product - Limited Time Offer!",
            description="Get the best deals on premium products. Free shipping and 30-day guarantee.",
            cta="Shop Now"
        )

        response = await MLService.score_creative_content(request)

        print(f"Creative Score: {response.scores['final']}/10")
        print("Component Scores:")
        for component, score in response.scores.items():
            if component != 'final':
                print(f"  {component}: {score}/10")

        if response.feedback:
            print("Feedback:")
            for feedback in response.feedback[:2]:
                print(f"  - {feedback}")

        return True
    except Exception as e:
        print(f"✗ Creative scoring error: {e}")
        return False

async def main():
    """Run all tests"""
    print("ML Integration Test")
    print("=" * 40)

    # Test imports
    imports_ok = await test_imports()
    if not imports_ok:
        print("Cannot proceed without ML dependencies")
        return

    # Test model loading
    models_ok = await test_model_loading()

    # Test creative scoring
    scoring_ok = await test_creative_scoring()

    print("\n" + "=" * 40)
    if models_ok and scoring_ok:
        print("SUCCESS: All tests passed!")
        print("\nYour ML models are working correctly.")
        print("Start the backend with: python main.py")
    else:
        print("PARTIAL: Some tests failed, but basic functionality available")

if __name__ == "__main__":
    asyncio.run(main())