#!/usr/bin/env python3
"""
Create mock model files for testing backend functionality
"""
import os
import json
from pathlib import Path

def create_mock_models():
    """Create mock model files for testing"""
    print("Creating mock model files for testing...")
    
    # Create directories
    backend_models_dir = Path("backend/models")
    model_dir = Path("model")
    backend_models_dir.mkdir(parents=True, exist_ok=True)
    
    # Mock feature columns (based on notebook)
    feature_columns = [
        'budget_instagram', 'budget_google', 'budget_tiktok', 
        'budget_facebook', 'budget_youtube', 'budget_linkedin',
        'pct_instagram', 'pct_google', 'pct_tiktok', 
        'pct_facebook', 'pct_youtube', 'pct_linkedin',
        'total_budget', 'aov', 'creative_quality', 'campaign_days', 
        'target_margin', 'age',
        'gender_all', 'gender_man', 'gender_woman',
        'income_level_all', 'income_level_high', 'income_level_low'
    ]
    
    # Save feature columns to both locations
    feature_file = "model_feature_columns_usd.json"
    
    for directory in [model_dir, backend_models_dir]:
        feature_path = directory / feature_file
        with open(feature_path, 'w') as f:
            json.dump(feature_columns, f, indent=2)
        print(f"Created {feature_path}")
    
    # Create mock model file (this is just a placeholder)
    mock_model_content = """# Mock model file - this is a placeholder
# To create the real model, run your Jupyter notebook CAMPAIGNMODEL.ipynb
# The notebook will train a LightGBM model and save it as campaign_optimizer_usd.pkl

# For now, the backend will use fallback logic when this file is missing
"""
    
    model_file = "campaign_optimizer_usd_README.txt"
    
    for directory in [model_dir, backend_models_dir]:
        model_path = directory / model_file
        with open(model_path, 'w') as f:
            f.write(mock_model_content)
        print(f"Created {model_path}")
    
    print("\nMock files created!")
    print("\nTo get full ML functionality:")
    print("1. Open model/CAMPAIGNMODEL.ipynb in Jupyter/Colab")
    print("2. Run all cells to train and save the model")
    print("3. The .pkl file will be saved automatically")
    print("\nFor now, the backend will run with fallback logic")

def main():
    create_mock_models()

if __name__ == "__main__":
    main()