"""
Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Dict, Any
from app.services.auth_service import auth_service
from app.core.auth_middleware import get_current_user, require_auth

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    success: bool
    message: str = ""
    access_token: str = ""
    token_type: str = ""
    user: Dict[str, Any] = {}

@router.post("/register", response_model=Dict[str, Any])
async def register_user(user_data: UserRegister):
    """Register a new user"""
    result = await auth_service.register_user(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Registration failed")
        )
    
    return result

@router.post("/login", response_model=Dict[str, Any])
async def login_user(user_data: UserLogin):
    """Login user"""
    result = await auth_service.login_user(
        email=user_data.email,
        password=user_data.password
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("error", "Invalid credentials")
        )
    
    return result

@router.post("/logout")
async def logout_user(current_user: Dict[str, Any] = Depends(require_auth)):
    """Logout current user"""
    result = await auth_service.logout_user()
    return result

@router.get("/me")
async def get_current_user_info(current_user: Dict[str, Any] = Depends(require_auth)):
    """Get current user information"""
    return {
        "success": True,
        "user": current_user
    }

@router.get("/health")
async def auth_health_check():
    """Check auth service health"""
    return {
        "service": "authentication",
        "status": "healthy" if auth_service.supabase else "degraded",
        "supabase_connected": auth_service.supabase is not None
    }