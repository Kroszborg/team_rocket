#!/usr/bin/env python3
"""
Development script to run the Team Rocket Backend locally
"""
import os
import sys
import subprocess
import shutil
from pathlib import Path

def check_model_files():
    """Check if model files exist and copy them if needed"""
    parent_model_dir = Path("../model")
    local_model_dir = Path("./models")
    
    # Create local model directory if it doesn't exist
    local_model_dir.mkdir(exist_ok=True)
    
    # Map of source files to target files
    model_files = {
        "CAMPAIGNMODEL.pkl": "campaign_optimizer_usd.pkl",
        "model_feature_columns_usd.json": "model_feature_columns_usd.json"
    }
    
    missing_files = []
    for source_file, target_file in model_files.items():
        source = parent_model_dir / source_file
        target = local_model_dir / target_file
        
        if source.exists():
            if not target.exists() or source.stat().st_mtime > target.stat().st_mtime:
                print(f"Copying {source_file} to {target_file}...")
                shutil.copy2(source, target)
        else:
            missing_files.append(source_file)
    
    if missing_files:
        print(f"Warning: Missing model files: {missing_files}")
        print("Run 'python ../export_models.py' from the root directory to create them")
        print("The service will still run but will use fallback logic for ML features.")
    else:
        print("All model files are available")

def install_dependencies():
    """Install Python dependencies"""
    print("Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True)
        print("Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"Failed to install dependencies: {e}")
        return False
    return True

def run_service():
    """Run the FastAPI service"""
    print("Starting Team Rocket Backend...")
    print("Backend will be available at: http://localhost:8000")
    print("API docs will be available at: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the service")
    
    # Set environment variables for development
    os.environ["ENVIRONMENT"] = "development"
    os.environ["DEBUG"] = "true"
    os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000,http://localhost:3001"
    
    try:
        subprocess.run([sys.executable, "main.py"])
    except KeyboardInterrupt:
        print("\nBackend stopped")

def main():
    print("Team Rocket Backend Development Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("main.py").exists():
        print("Please run this script from the backend directory")
        sys.exit(1)
    
    # Check and copy model files
    check_model_files()
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Run the service
    run_service()

if __name__ == "__main__":
    main()