#!/usr/bin/env python3
"""
Quick test script to verify the backend API is working
"""
import requests
import json
import sys

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=10)
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_campaign_optimize():
    """Test campaign optimization endpoint"""
    try:
        campaign_data = {
            "product": {
                "name": "Test Product",
                "category": "electronics",
                "price": 99.99
            },
            "budget": {
                "total": 1000,
                "duration": 30
            },
            "targeting": {
                "age_range": {"min": 25, "max": 45},
                "gender": "all",
                "interests": ["technology", "gadgets"]
            },
            "channels": {
                "preferred": ["facebook", "google"]
            }
        }
        
        response = requests.post(
            "http://localhost:8000/api/campaigns/optimize",
            json=campaign_data,
            timeout=30
        )
        print(f"✅ Campaign optimize: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ML Model Available: {not result.get('fallback_used', True)}")
            print(f"   Expected ROI: {result.get('expected_roi', 'N/A')}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Campaign optimize failed: {e}")
        return False

def test_creative_score():
    """Test creative scoring endpoint"""
    try:
        creative_data = {
            "title": "Amazing New Product!",
            "description": "Revolutionary technology that will change your life",
            "cta": "Buy Now",
            "channel": "facebook",
            "target_audience": "tech enthusiasts aged 25-45"
        }
        
        response = requests.post(
            "http://localhost:8000/api/creative/score",
            json=creative_data,
            timeout=30
        )
        print(f"✅ Creative score: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Overall Score: {result.get('overall_score', 'N/A')}")
            print(f"   ML Model Available: {not result.get('fallback_used', True)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Creative score failed: {e}")
        return False

def main():
    print("🚀 Testing Team Rocket Backend API...")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("Campaign Optimization", test_campaign_optimize),
        ("Creative Scoring", test_creative_score)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name}...")
        if test_func():
            passed += 1
        print("-" * 30)
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the backend logs.")
        return 1

if __name__ == "__main__":
    sys.exit(main())