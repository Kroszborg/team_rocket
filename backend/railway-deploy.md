# 🚀 Team Rocket Backend - Railway Deployment Guide

## 📋 **Prerequisites**

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your backend code must be in a GitHub repo
3. **Environment Variables**: API keys ready

## 🛠️ **Step 1: Prepare for Deployment**

### **Create Railway Configuration**

Create `railway.toml` in your backend folder:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile.fast"

[deploy]
startCommand = "./docker-entrypoint.sh"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "always"

[variables]
PORT = "8000"
```

### **Create Production Environment File**

Create `.env.production`:

```env
# Production Environment Variables
ENVIRONMENT=production
DEBUG=false
PORT=8000

# CORS Settings (add your frontend domain)
ALLOWED_ORIGINS=["https://your-vercel-app.vercel.app","http://localhost:3000"]

# Database (optional - Railway provides PostgreSQL)
# DATABASE_URL=postgresql://user:pass@host:port/db

# AI API Keys
GEMINI_API_KEY=your_gemini_key_here

# ML Model Settings
MODEL_PATH=/app/models
```

### **Update Dockerfile for Production**

Your `Dockerfile.fast` is already production-ready! ✅

## 🚀 **Step 2: Deploy to Railway**

### **Method 1: GitHub Integration (Recommended)**

1. **Push to GitHub**:
   ```bash
   cd C:\coding\team_rocket\backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/team-rocket-backend.git
   git push -u origin main
   ```

2. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect your Dockerfile

3. **Configure Environment Variables**:
   - Go to your Railway project
   - Click "Variables" tab
   - Add each variable from `.env.production`

### **Method 2: Railway CLI**

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**:
   ```bash
   cd C:\coding\team_rocket\backend
   railway login
   railway init
   railway up
   ```

## ⚙️ **Step 3: Configure Environment Variables**

Add these in Railway dashboard → Variables:

| **Variable** | **Value** | **Required** |
|--------------|-----------|--------------|
| `ENVIRONMENT` | `production` | ✅ |
| `DEBUG` | `false` | ✅ |
| `PORT` | `8000` | ✅ |
| `ALLOWED_ORIGINS` | `["https://your-app.vercel.app"]` | ✅ |
| `GEMINI_API_KEY` | `your_actual_key` | ⚠️ Optional |
| `MODEL_PATH` | `/app/models` | ✅ |

## 🔗 **Step 4: Get Your Backend URL**

After deployment, Railway provides a URL like:
```
https://team-rocket-backend-production.up.railway.app
```

## 📁 **Do You Need to Deploy the Model Folder?**

**NO!** 🎉 Your models are already included:

- ✅ **Models copied during build**: `docker-entrypoint.sh` copies your models
- ✅ **Self-contained**: Backend includes everything needed
- ✅ **No external dependencies**: Models are bundled in the Docker image

The deployment process automatically includes your `CAMPAIGNMODEL.pkl` file.

## 🌐 **Step 5: Connect Frontend (Vercel) to Backend (Railway)**

### **Update Frontend Environment Variables**

In your Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://team-rocket-backend-production.up.railway.app
```

### **Update Frontend API Calls**

In your Next.js app, update API base URL:

```javascript
// src/lib/api.ts or similar
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const campaignAPI = {
  optimize: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/campaigns/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

### **Update CORS Settings**

In Railway, update the `ALLOWED_ORIGINS` environment variable:
```json
["https://your-vercel-app.vercel.app", "https://your-custom-domain.com"]
```

## ✅ **Step 6: Verify Deployment**

Test these endpoints:

1. **Health Check**: `https://your-railway-app.railway.app/health`
2. **ML Status**: `https://your-railway-app.railway.app/api/ml/health`
3. **API Docs**: `https://your-railway-app.railway.app/docs`

## 🔧 **Production Checklist**

- ✅ **ML Models**: Loaded and working
- ✅ **Environment Variables**: Set correctly
- ✅ **CORS**: Frontend domain allowed
- ✅ **Health Checks**: Responding
- ✅ **API Documentation**: Accessible
- ✅ **Database**: Connected (if needed)
- ✅ **Monitoring**: Railway provides built-in metrics

## 🚨 **Common Issues & Solutions**

### **Issue: Build Timeout**
**Solution**: Railway has 10-minute build limit. The fast Dockerfile should build in 3-5 minutes.

### **Issue: Model Not Loading**
**Solution**: Check Railway logs for model file paths. Models should be in `/app/models/`

### **Issue: CORS Errors**
**Solution**: Update `ALLOWED_ORIGINS` with your exact Vercel URL.

### **Issue: Environment Variables**
**Solution**: Verify all required variables are set in Railway dashboard.

## 📊 **Monitoring Your Deployment**

Railway provides:
- ✅ **Build Logs**: See deployment progress
- ✅ **Runtime Logs**: Monitor application output  
- ✅ **Metrics**: CPU, memory, network usage
- ✅ **Health Checks**: Automatic monitoring

## 🎯 **Next Steps After Deployment**

1. **Test all API endpoints** from your frontend
2. **Monitor performance** in Railway dashboard
3. **Set up domain** (optional) for custom URL
4. **Scale resources** if needed (Railway auto-scales)

Your backend is **production-ready** and includes all ML capabilities! 🚀