"""
Authentication service using Supabase
"""
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.supabase: Optional[Client] = None
        self._initialize_supabase()
    
    def _initialize_supabase(self):
        """Initialize Supabase client"""
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            logger.warning("Supabase credentials not configured. Auth features will be disabled.")
            return
        
        try:
            self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    async def register_user(self, email: str, password: str, full_name: str = "") -> Dict[str, Any]:
        """Register a new user with Supabase"""
        if not self.supabase:
            return {"success": False, "error": "Authentication service not available"}
        
        try:
            # Register with Supabase Auth
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name
                    }
                }
            })
            
            if response.user:
                return {
                    "success": True,
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email,
                        "full_name": full_name
                    },
                    "message": "User registered successfully"
                }
            else:
                return {"success": False, "error": "Registration failed"}
                
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return {"success": False, "error": str(e)}
    
    async def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """Login user with Supabase"""
        if not self.supabase:
            return {"success": False, "error": "Authentication service not available"}
        
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user:
                # Create our own JWT token
                access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
                access_token = self.create_access_token(
                    data={"sub": response.user.id, "email": response.user.email},
                    expires_delta=access_token_expires
                )
                
                return {
                    "success": True,
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email,
                        "full_name": response.user.user_metadata.get("full_name", "")
                    }
                }
            else:
                return {"success": False, "error": "Invalid credentials"}
                
        except Exception as e:
            logger.error(f"Login error: {e}")
            return {"success": False, "error": "Invalid credentials"}
    
    async def get_current_user(self, token: str) -> Optional[Dict[str, Any]]:
        """Get current user from JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            email: str = payload.get("email")
            
            if user_id is None or email is None:
                return None
                
            return {
                "id": user_id,
                "email": email
            }
        except JWTError:
            return None
    
    async def logout_user(self) -> Dict[str, Any]:
        """Logout user from Supabase"""
        if not self.supabase:
            return {"success": False, "error": "Authentication service not available"}
        
        try:
            self.supabase.auth.sign_out()
            return {"success": True, "message": "Logged out successfully"}
        except Exception as e:
            logger.error(f"Logout error: {e}")
            return {"success": False, "error": str(e)}

# Global instance
auth_service = AuthService()