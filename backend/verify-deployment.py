#!/usr/bin/env python3
"""
Verify Team Rocket Backend deployment
"""
import requests
import sys
import json

def test_endpoint(url, description):
    """Test an endpoint and return success status"""
    try:
        print(f"Testing {description}...")
        response = requests.get(url, timeout=10)
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"  Response: {json.dumps(data, indent=2)[:200]}...")
            except:
                print(f"  Response: {response.text[:100]}...")
            print("  ✅ PASS")
            return True
        else:
            print("  ❌ FAIL")
            return False
            
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return False

def main():
    # Change this to your Railway URL when deployed
    base_url = input("Enter your backend URL (or press Enter for localhost:8000): ").strip()
    
    if not base_url:
        base_url = "http://localhost:8000"
    
    if not base_url.startswith("http"):
        base_url = f"https://{base_url}"
    
    print(f"\n🚀 Testing Team Rocket Backend at: {base_url}")
    print("=" * 60)
    
    tests = [
        (f"{base_url}/health", "Health Check"),
        (f"{base_url}/api/ml/health", "ML Service Status"),
        (f"{base_url}/docs", "API Documentation"),
    ]
    
    passed = 0
    total = len(tests)
    
    for url, description in tests:
        if test_endpoint(url, description):
            passed += 1
        print()
    
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Deployment verified! Backend is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the logs and configuration.")
        return 1

if __name__ == "__main__":
    sys.exit(main())