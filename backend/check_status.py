#!/usr/bin/env python3
"""
Check backend status for local and deployment
"""
import os
import sys

def check_basic_imports():
    """Check if basic backend imports work"""
    print("=== Basic Backend Check ===")
    try:
        from fastapi import FastAPI
        print("PASS: FastAPI import")

        from app.core.config import settings
        print("PASS: Settings import")

        print("RESULT: Backend basics work")
        return True
    except Exception as e:
        print(f"FAIL: Basic imports - {e}")
        return False

def check_ml_dependencies():
    """Check ML dependencies"""
    print("\n=== ML Dependencies Check ===")
    ml_deps = [
        ('numpy', 'numpy'),
        ('pandas', 'pandas'),
        ('torch', 'torch'),
        ('transformers', 'transformers'),
        ('sentence_transformers', 'sentence_transformers'),
        ('lightgbm', 'lightgbm')
    ]

    available = []
    missing = []

    for name, module in ml_deps:
        try:
            __import__(module)
            print(f"PASS: {name}")
            available.append(name)
        except ImportError:
            print(f"FAIL: {name} - not installed")
            missing.append(name)

    print(f"\nML Status: {len(available)}/{len(ml_deps)} dependencies available")
    return len(available) > 0, missing

def check_model_files():
    """Check if model files exist"""
    print("\n=== Model Files Check ===")

    model_files = [
        'models/campaign_optimizer_usd.pkl',
        'models/model_feature_columns_usd.json',
        'models/distilbert_creative_scorer/config.json',
        'models/distilbert_creative_scorer/model.safetensors',
    ]

    found = []
    missing = []

    for file_path in model_files:
        if os.path.exists(file_path):
            print(f"PASS: {file_path}")
            found.append(file_path)
        else:
            print(f"FAIL: {file_path} - missing")
            missing.append(file_path)

    print(f"\nModel Files: {len(found)}/{len(model_files)} found")
    return len(found) > 0, missing

def check_environment():
    """Check environment setup"""
    print("\n=== Environment Check ===")

    env_vars = [
        'GEMINI_API_KEY',
        'SUPABASE_URL',
        'SUPABASE_KEY'
    ]

    for var in env_vars:
        value = os.getenv(var)
        if value:
            print(f"PASS: {var} = {value[:20]}...")
        else:
            print(f"WARN: {var} - not set")

def deployment_recommendations():
    """Provide deployment recommendations"""
    print("\n=== Deployment Recommendations ===")

    # Check if we're in a deployment environment
    is_railway = os.getenv("RAILWAY_ENVIRONMENT") is not None
    is_vercel = os.getenv("VERCEL") is not None

    if is_railway:
        print("Environment: Railway detected")
        print("Recommendations:")
        print("- Large model files may cause deployment issues")
        print("- Consider using model APIs instead of local files")
        print("- Ensure requirements.txt has all dependencies")
    elif is_vercel:
        print("Environment: Vercel detected")
        print("Note: Vercel doesn't support this backend (use Netlify/Railway)")
    else:
        print("Environment: Local development")
        print("Recommendations:")
        print("- Install ML dependencies: pip install -r requirements.txt")
        print("- Ensure model files are in correct locations")

def main():
    """Main status check"""
    print("Backend Status Check")
    print("=" * 50)

    # Basic checks
    basic_ok = check_basic_imports()

    if not basic_ok:
        print("\nCRITICAL: Basic backend imports failed")
        return False

    # ML checks
    ml_ok, missing_deps = check_ml_dependencies()
    models_ok, missing_models = check_model_files()

    # Environment check
    check_environment()

    # Deployment recommendations
    deployment_recommendations()

    # Overall status
    print("\n" + "=" * 50)
    print("OVERALL STATUS:")

    if basic_ok and ml_ok and models_ok:
        print("STATUS: FULLY READY - All systems operational")
        print("- Backend can run locally with full ML features")
        print("- Ready for deployment (with model size considerations)")
    elif basic_ok and ml_ok:
        print("STATUS: PARTIAL - ML ready but models missing")
        print("- Backend works with fallback logic")
        print("- Need to ensure model files are accessible")
    elif basic_ok:
        print("STATUS: BASIC - Backend works, ML unavailable")
        print("- Backend runs but uses fallback logic")
        print("- Install ML dependencies for full features")
    else:
        print("STATUS: BROKEN - Cannot start backend")
        print("- Fix basic import issues first")

    print(f"\nTo start backend: python main.py")
    print(f"Health check: http://localhost:8000/health")
    print(f"ML health: http://localhost:8000/api/ml/health")

    return basic_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)