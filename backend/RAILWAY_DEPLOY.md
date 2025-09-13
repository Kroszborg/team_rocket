# Railway Deployment Guide

## Quick Fix for Current Issue

The build is timing out because Railway is using the slow `Dockerfile` instead of the optimized one. Here are the solutions:

### Option 1: Use Railway-Optimized Dockerfile (Recommended)

1. **Update your Railway configuration** to use the new Dockerfile:
   ```bash
   # In your Railway project settings, set:
   # Build Command: (leave empty, handled by Dockerfile)
   # Start Command: (leave empty, handled by Dockerfile)
   # Dockerfile Path: Dockerfile.railway
   ```

2. **Or update railway.toml** (already done):
   ```toml
   [build]
   builder = "dockerfile"
   dockerfilePath = "Dockerfile.railway"
   ```

### Option 2: Use Nixpacks (Faster for Railway)

If Docker still times out, switch to Nixpacks:

1. **Update railway.toml**:
   ```toml
   [build]
   builder = "nixpacks"

   [deploy]
   startCommand = "python main.py"
   ```

2. **Railway will use nixpacks.toml** (already created)

## Files Created for Railway

1. **Dockerfile.railway** - Optimized Docker build using conda
2. **docker-entrypoint-railway.sh** - Railway-specific startup script
3. **requirements-railway.txt** - Minimal dependencies for faster builds
4. **nixpacks.toml** - Alternative Nixpacks configuration
5. **Updated railway.toml** - Railway deployment configuration

## Environment Variables to Set in Railway

```bash
RAILWAY_ENVIRONMENT=production
PYTHONPATH=/app
PYTHONUNBUFFERED=1
```

## Key Optimizations Made

1. **Conda for ML Dependencies**: Uses pre-compiled conda packages instead of compiling from source
2. **Minimal Requirements**: Only installs essential dependencies
3. **No Model Loading**: Gracefully handles missing ML models with fallback responses
4. **Railway-Specific Configs**: Optimized uvicorn settings for Railway
5. **Fast Health Checks**: Reduced timeout settings

## Expected Build Time

- **Docker**: ~2-4 minutes (vs 10+ minutes with original)
- **Nixpacks**: ~1-2 minutes

## Deployment Steps

1. **Push the changes** to your repository
2. **In Railway dashboard**:
   - Go to your service settings
   - Under "Build", set Dockerfile Path to `Dockerfile.railway`
   - Or change to Nixpacks builder
3. **Redeploy** the service

## Troubleshooting

If build still fails:

1. **Try Nixpacks**: Switch to `builder = "nixpacks"` in railway.toml
2. **Reduce Dependencies**: Remove sentence-transformers if not needed
3. **Check Logs**: Railway build logs will show exactly where it fails
4. **Manual Deploy**: Use Railway CLI for more control

## Production Notes

- The app will run without ML models and use fallback responses
- This is perfect for testing the API endpoints
- You can add models later via Railway volumes or external storage