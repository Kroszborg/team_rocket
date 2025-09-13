#!/usr/bin/env python3
"""
Export trained models from notebooks to backend/models directory
"""
import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from lightgbm import LGBMRegressor
import joblib
import json
from pathlib import Path

def export_campaign_model():
    """Export campaign optimization model"""
    print("🔄 Training and exporting campaign optimization model...")
    
    # Load dataset
    csv_path = "model/synthetic_campaigns_updated_usd.csv"
    if not os.path.exists(csv_path):
        print(f"❌ Dataset not found at {csv_path}")
        return False
    
    df = pd.read_csv(csv_path)
    print(f"✅ Loaded dataset with {len(df)} rows and {len(df.columns)} columns")
    
    # Define features
    channel_names = ["instagram", "google", "tiktok", "facebook", "youtube", "linkedin"]
    budget_cols = [f"budget_{ch}" for ch in channel_names]
    pct_cols = [f"pct_{ch}" for ch in channel_names]
    extra_features = [
        "total_budget", "aov", "creative_quality", "campaign_days", 
        "target_margin", "age", "gender", "income_level"
    ]
    feature_cols = budget_cols + pct_cols + extra_features
    target_col = "revenue"
    
    # Check for missing columns
    missing = [c for c in feature_cols + [target_col] if c not in df.columns]
    if missing:
        print(f"❌ Missing columns in dataset: {missing}")
        return False
    
    # Prepare features and target
    X = df[feature_cols].copy()
    y = df[target_col].copy()
    
    # One-hot encode categoricals
    categorical_cols = ["gender", "income_level"]
    X = pd.get_dummies(X, columns=categorical_cols, drop_first=False)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"📊 Train rows: {len(X_train)}, Test rows: {len(X_test)}")
    
    # Train model
    model = LGBMRegressor(
        n_estimators=300,
        learning_rate=0.05,
        num_leaves=31,
        random_state=42,
        verbose=-1  # Suppress training output
    )
    
    print("🎯 Training LightGBM model...")
    model.fit(X_train, y_train)
    
    # Evaluate
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    mape = np.mean(np.abs((y_test - preds) / (y_test + 1e-9))) * 100
    
    print(f"📈 Model Performance:")
    print(f"   MAE  : ${mae:.2f}")
    print(f"   RMSE : ${rmse:.2f}")
    print(f"   MAPE : {mape:.2f}%")
    
    # Create output directories
    backend_models_dir = Path("backend/models")
    model_dir = Path("model")
    backend_models_dir.mkdir(parents=True, exist_ok=True)
    
    # Save to both locations
    model_files = [
        (model, "campaign_optimizer_usd.pkl"),
        (list(X.columns), "model_feature_columns_usd.json")
    ]
    
    for data, filename in model_files:
        # Save to model/ directory
        model_path = model_dir / filename
        backend_path = backend_models_dir / filename
        
        if filename.endswith('.pkl'):
            joblib.dump(data, model_path)
            joblib.dump(data, backend_path)
        else:
            with open(model_path, 'w') as f:
                json.dump(data, f)
            with open(backend_path, 'w') as f:
                json.dump(data, f)
        
        print(f"✅ Saved {filename} to:")
        print(f"   📁 {model_path}")
        print(f"   📁 {backend_path}")
    
    # Test quick inference
    example = {
        "budget_instagram": 300, "budget_google": 400, "budget_tiktok": 200,
        "budget_facebook": 150, "budget_youtube": 100, "budget_linkedin": 50,
        "pct_instagram": 0.25, "pct_google": 0.33, "pct_tiktok": 0.17,
        "pct_facebook": 0.125, "pct_youtube": 0.083, "pct_linkedin": 0.042,
        "total_budget": 1200, "aov": 50, "creative_quality": 0.7,
        "campaign_days": 10, "target_margin": 0.25, "age": 28,
        "gender": "man", "income_level": "high"
    }
    
    example_df = pd.DataFrame([example])
    example_df = pd.get_dummies(example_df, columns=categorical_cols)
    for col in X.columns:
        if col not in example_df.columns:
            example_df[col] = 0
    example_df = example_df[X.columns]
    
    pred = model.predict(example_df)[0]
    print(f"🧪 Test prediction: ${pred:.2f}")
    
    return True

def export_nlp_requirements():
    """Create requirements for NLP models (they download automatically)"""
    print("📝 NLP models will be downloaded automatically by the backend")
    print("   - sentence-transformers: all-MiniLM-L6-v2")
    print("   - transformers: Vamsi/T5_Paraphrase_Paws")
    return True

def cleanup_old_service():
    """Clean up the old ml-service directory"""
    ml_service_dir = Path("ml-service")
    if ml_service_dir.exists():
        print(f"🧹 Found old ml-service directory at {ml_service_dir}")
        response = input("Remove old ml-service directory? (y/N): ").strip().lower()
        if response == 'y':
            import shutil
            shutil.rmtree(ml_service_dir)
            print("✅ Removed old ml-service directory")
        else:
            print("⏭️  Keeping old ml-service directory")
    return True

def main():
    print("🚀 Team Rocket Model Export Script")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("model").exists() or not Path("backend").exists():
        print("❌ Please run this script from the project root directory")
        print("   Expected structure: ./model/ and ./backend/")
        sys.exit(1)
    
    success = True
    
    # Export campaign model
    success &= export_campaign_model()
    
    # Note about NLP models
    success &= export_nlp_requirements()
    
    # Clean up old service
    success &= cleanup_old_service()
    
    if success:
        print("\n🎉 Model export completed successfully!")
        print("\nNext steps:")
        print("1. cd backend")
        print("2. python run_dev.py")
        print("3. Check http://localhost:8000/api/ml/health")
    else:
        print("\n❌ Model export failed. Check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()