@echo off
echo 🚀 Starting Team Rocket Backend with Docker...
echo.
echo This will:
echo - Build the Docker container with all ML dependencies
echo - Mount your model files from ../model/ directory  
echo - Start the backend on http://localhost:8000
echo.

REM Stop any existing container
docker-compose down 2>NUL

REM Build and start
docker-compose up --build

pause