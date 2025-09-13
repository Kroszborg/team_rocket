import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Team Rocket Backend"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://your-frontend-domain.com"
    ]
    
    # Database (if needed in future)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./team_rocket.db")
    
    # ML Models
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./models")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()