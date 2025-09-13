@echo off
echo 🚀 Starting Team Rocket Backend with FAST Docker setup...
echo.
echo This uses a pre-built scientific Python image (much faster!)
echo.

REM Stop any existing containers
docker-compose -f docker-compose.fast.yml down 2>NUL

REM Build and start with the fast configuration  
docker-compose -f docker-compose.fast.yml up --build

pause