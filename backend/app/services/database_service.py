"""
Database service for campaign and user data using Supabase
"""
import logging
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.supabase: Optional[Client] = None
        self._initialize_supabase()
    
    def _initialize_supabase(self):
        """Initialize Supabase client"""
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            logger.warning("Supabase credentials not configured. Database features will be disabled.")
            return
        
        try:
            # Use service key for database operations
            self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            logger.info("Supabase database client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase database client: {e}")
    
    async def save_campaign(self, user_id: str, campaign_data: Dict[str, Any], 
                          optimization_results: Dict[str, Any]) -> Optional[str]:
        """Save campaign and results to database"""
        if not self.supabase:
            logger.warning("Database service not available")
            return None
        
        try:
            campaign_id = str(uuid.uuid4())
            
            # Prepare campaign record
            campaign_record = {
                "id": campaign_id,
                "user_id": user_id,
                "name": campaign_data.get("name", f"Campaign {datetime.now().strftime('%Y-%m-%d %H:%M')}"),
                "product_data": campaign_data.get("product", {}),
                "budget_data": campaign_data.get("budget", {}),
                "targeting_data": campaign_data.get("targeting", {}),
                "channels_data": campaign_data.get("channels", {}),
                "optimization_results": optimization_results,
                "status": "completed",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Insert campaign
            result = self.supabase.table("campaigns").insert(campaign_record).execute()
            
            if result.data:
                logger.info(f"Campaign saved successfully: {campaign_id}")
                return campaign_id
            else:
                logger.error("Failed to save campaign")
                return None
                
        except Exception as e:
            logger.error(f"Error saving campaign: {e}")
            return None
    
    async def get_user_campaigns(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all campaigns for a user"""
        if not self.supabase:
            return []
        
        try:
            result = self.supabase.table("campaigns") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .limit(limit) \
                .execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error fetching user campaigns: {e}")
            return []
    
    async def get_campaign_by_id(self, campaign_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get specific campaign by ID (with user ownership check)"""
        if not self.supabase:
            return None
        
        try:
            result = self.supabase.table("campaigns") \
                .select("*") \
                .eq("id", campaign_id) \
                .eq("user_id", user_id) \
                .execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error fetching campaign {campaign_id}: {e}")
            return None
    
    async def delete_campaign(self, campaign_id: str, user_id: str) -> bool:
        """Delete campaign (with user ownership check)"""
        if not self.supabase:
            return False
        
        try:
            result = self.supabase.table("campaigns") \
                .delete() \
                .eq("id", campaign_id) \
                .eq("user_id", user_id) \
                .execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Error deleting campaign {campaign_id}: {e}")
            return False
    
    async def update_campaign(self, campaign_id: str, user_id: str, 
                            updates: Dict[str, Any]) -> bool:
        """Update campaign data"""
        if not self.supabase:
            return False
        
        try:
            updates["updated_at"] = datetime.utcnow().isoformat()
            
            result = self.supabase.table("campaigns") \
                .update(updates) \
                .eq("id", campaign_id) \
                .eq("user_id", user_id) \
                .execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Error updating campaign {campaign_id}: {e}")
            return False
    
    async def save_creative_test(self, user_id: str, campaign_id: str, 
                               creative_data: Dict[str, Any], results: Dict[str, Any]) -> Optional[str]:
        """Save creative test results"""
        if not self.supabase:
            return None
        
        try:
            test_id = str(uuid.uuid4())
            
            test_record = {
                "id": test_id,
                "user_id": user_id,
                "campaign_id": campaign_id,
                "creative_data": creative_data,
                "test_results": results,
                "created_at": datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table("creative_tests").insert(test_record).execute()
            
            if result.data:
                return test_id
            return None
            
        except Exception as e:
            logger.error(f"Error saving creative test: {e}")
            return None
    
    async def get_campaign_creative_tests(self, campaign_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Get all creative tests for a campaign"""
        if not self.supabase:
            return []
        
        try:
            result = self.supabase.table("creative_tests") \
                .select("*") \
                .eq("campaign_id", campaign_id) \
                .eq("user_id", user_id) \
                .order("created_at", desc=True) \
                .execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error fetching creative tests: {e}")
            return []
    
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user statistics"""
        if not self.supabase:
            return {}
        
        try:
            # Count campaigns
            campaigns_result = self.supabase.table("campaigns") \
                .select("id", count="exact") \
                .eq("user_id", user_id) \
                .execute()
            
            # Count creative tests
            tests_result = self.supabase.table("creative_tests") \
                .select("id", count="exact") \
                .eq("user_id", user_id) \
                .execute()
            
            return {
                "total_campaigns": campaigns_result.count or 0,
                "total_creative_tests": tests_result.count or 0,
                "member_since": "2024"  # You can improve this by storing user registration date
            }
            
        except Exception as e:
            logger.error(f"Error fetching user stats: {e}")
            return {}

# Global instance
database_service = DatabaseService()