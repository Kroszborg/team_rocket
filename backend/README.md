# Team Rocket Backend

Unified FastAPI backend for Team Rocket campaign management and AI-powered optimization.

## 🚀 Features

- **Campaign Management**: Full CRUD operations for marketing campaigns
- **AI-Powered Optimization**: Budget allocation optimization using trained ML models
- **Creative Scoring**: NLP-powered ad copy analysis and improvement suggestions
- **Real-time Simulation**: Campaign performance simulation and metrics
- **Production Ready**: FastAPI with async support, health checks, and auto-scaling

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/routes/          # API endpoints
│   ├── core/                # Core configuration and storage
│   ├── models/              # Pydantic models and types
│   └── services/            # Business logic services
├── models/                  # ML model files
├── storage/                 # File-based data storage
├── main.py                  # FastAPI application entry point
├── requirements.txt         # Python dependencies
└── deployment configs/      # Docker, Railway, Heroku configs
```

## 🛠️ Development Setup

### Quick Start

```bash
cd backend
python run_dev.py
```

This will:
1. Copy ML models from `../model/` directory
2. Install all dependencies
3. Start the development server

### Manual Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Copy model files (optional, will use fallbacks if not available)
cp ../model/campaign_optimizer_usd.pkl ./models/
cp ../model/model_feature_columns_usd.json ./models/

# Set environment variables
export ENVIRONMENT=development
export DEBUG=true
export ALLOWED_ORIGINS=http://localhost:3000

# Run the server
python main.py
```

The backend will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📋 API Endpoints

### Campaign Management

#### Create Campaign
```http
POST /api/campaigns/
Content-Type: application/json

{
  "name": "Summer Campaign 2024",
  "product": {
    "name": "Premium Headphones",
    "category": "electronics",
    "price": 299.99,
    "description": "High-quality wireless headphones",
    "target_margin": 25
  },
  "targeting": {
    "age_range": {"min": 25, "max": 45},
    "gender": "all",
    "interests": ["music", "technology"],
    "location": ["US", "CA"],
    "income": "high"
  },
  "budget": {
    "total": 10000,
    "duration": 30,
    "channels": {
      "facebook": 3000,
      "instagram": 2500,
      "google-ads": 4500
    }
  },
  "channels": {
    "preferred": ["facebook", "instagram", "google-ads"],
    "avoided": ["tiktok"]
  }
}
```

#### Get Campaigns
```http
GET /api/campaigns/?limit=10&offset=0
```

#### Get Campaign Results
```http
GET /api/campaigns/{campaign_id}/results
```

### Creative Scoring

#### Score Creative Content
```http
POST /api/creative/score
Content-Type: application/json

{
  "channel": "instagram",
  "title": "🔥 Premium Headphones - 50% Off Limited Time!",
  "description": "Experience crystal-clear sound with our award-winning headphones. Perfect for music lovers and professionals. Free shipping & 30-day returns!",
  "cta": "Shop Now"
}
```

#### Generate Creative Suggestions
```http
GET /api/creative/suggestions?channel=instagram&product_name=Headphones&category=electronics
```

### ML Services

#### Campaign Budget Optimization
```http
POST /api/ml/campaign/optimize
Content-Type: application/json

{
  "total_budget": 10000,
  "aov": 299.99,
  "age": 35,
  "gender": "all",
  "income_level": "high",
  "creative_quality": 0.8,
  "campaign_days": 30,
  "target_margin": 0.25
}
```

#### ML Health Check
```http
GET /api/ml/health
```

## 🧠 ML Model Integration

The backend automatically loads and uses your trained models:

- **Campaign Optimization**: `models/campaign_optimizer_usd.pkl`
- **Feature Mapping**: `models/model_feature_columns_usd.json`
- **NLP Models**: Downloaded automatically (sentence-transformers, transformers)

### Fallback Behavior

If ML models are unavailable, the system gracefully falls back to rule-based algorithms, ensuring 100% uptime.

## 🗄️ Data Storage

Currently uses file-based storage in the `storage/` directory:
- `campaigns.json`: Campaign data
- `results.json`: Simulation results and optimization suggestions

For production, you can easily extend to use PostgreSQL, MongoDB, or other databases.

## 🚀 Deployment

### Option 1: Railway (Recommended)

1. Push your backend code to GitHub
2. Connect to Railway
3. Deploy with zero configuration
4. Railway automatically detects FastAPI and sets up the service

```bash
# Environment variables to set in Railway:
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Option 2: Docker

```bash
# Build and run
docker build -t team-rocket-backend .
docker run -p 8000:8000 team-rocket-backend

# Or use docker-compose
docker-compose up -d
```

### Option 3: Heroku

```bash
# Create Heroku app
heroku create team-rocket-backend

# Deploy
git subtree push --prefix backend heroku main

# Set environment variables
heroku config:set ENVIRONMENT=production
heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Option 4: VPS/Cloud Server

```bash
# On your server
git clone your-repo
cd team-rocket/backend

pip install -r requirements.txt

# Run with gunicorn for production
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file or set these environment variables:

```bash
# Required
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend.com,https://your-staging.com

# Optional
DEBUG=false
PORT=8000
MODEL_PATH=./models
STORAGE_DIR=./storage
```

### CORS Configuration

Update `ALLOWED_ORIGINS` in your deployment to match your frontend domain(s).

## 🔍 Monitoring and Health Checks

### Health Endpoint

```http
GET /health

{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "campaigns": true,
    "creative_scoring": true,
    "ml_models": true
  }
}
```

### ML Service Health

```http
GET /api/ml/health

{
  "status": "healthy",
  "models": {
    "campaign_model_loaded": true,
    "feature_columns_loaded": true,
    "nlp_embedder_loaded": true,
    "nlp_paraphraser_loaded": true,
    "models_loaded": true
  }
}
```

## 🔄 Frontend Integration

Update your frontend's API base URL to point to the deployed backend:

```javascript
// In your Next.js app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Update all fetch calls from /api/* to ${API_BASE_URL}/api/*
const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(campaignData)
});
```

## 📊 Performance Optimization

### Model Loading
- Models are loaded asynchronously on startup
- Lazy loading prevents blocking the API during initialization
- Automatic fallbacks ensure service availability

### Caching
- Results are cached in memory for identical requests
- File-based persistence reduces computation on restart

### Auto-scaling
- Stateless design enables horizontal scaling
- Health checks support load balancer integration
- Resource usage optimized for cost-effective deployment

## 🐛 Troubleshooting

### Model Loading Issues

```bash
# Check if models exist
ls -la models/

# Test model loading
python -c "
import joblib
model = joblib.load('models/campaign_optimizer_usd.pkl')
print('Model loaded successfully')
"
```

### Service Health

```bash
# Check service status
curl http://localhost:8000/health

# Check detailed ML status
curl http://localhost:8000/api/ml/health

# View logs
docker logs team-rocket-backend  # If using Docker
```

### CORS Issues

If your frontend can't connect:
1. Check `ALLOWED_ORIGINS` environment variable
2. Ensure frontend URL matches exactly (including protocol)
3. Verify the backend is accessible from your frontend domain

## 🔮 Future Enhancements

- **Database Integration**: PostgreSQL/MongoDB support
- **Authentication**: JWT-based API authentication
- **Rate Limiting**: API rate limiting and quotas
- **Caching**: Redis-based response caching
- **Metrics**: Prometheus metrics and Grafana dashboards
- **Model Versioning**: A/B testing for different model versions

## 📞 Support

For issues:
- **API Problems**: Check the interactive docs at `/docs`
- **Model Issues**: Verify model files in `models/` directory
- **Deployment**: Check platform-specific documentation
- **Performance**: Monitor the `/health` endpoint