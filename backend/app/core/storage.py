import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

from app.models.types import Campaign, SimulationResults, OptimizationSuggestion

class StoredCampaignResult:
    def __init__(self, campaign_id: str, campaign: Campaign, simulation: SimulationResults, 
                 optimization: List[OptimizationSuggestion], created_at: datetime = None):
        self.campaign_id = campaign_id
        self.campaign = campaign
        self.simulation = simulation
        self.optimization = optimization
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self) -> Dict:
        return {
            "campaign_id": self.campaign_id,
            "campaign": self.campaign.dict() if hasattr(self.campaign, 'dict') else self.campaign,
            "simulation": self.simulation.dict() if hasattr(self.simulation, 'dict') else self.simulation,
            "optimization": [opt.dict() if hasattr(opt, 'dict') else opt for opt in self.optimization],
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict):
        return cls(
            campaign_id=data["campaign_id"],
            campaign=data["campaign"],
            simulation=data["simulation"],
            optimization=data["optimization"],
            created_at=datetime.fromisoformat(data["created_at"])
        )

class FileStorage:
    def __init__(self, storage_dir: str = "./storage"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(exist_ok=True)
        
        self.campaigns_file = self.storage_dir / "campaigns.json"
        self.results_file = self.storage_dir / "results.json"
        
        self.campaigns: Dict[str, Campaign] = {}
        self.results: Dict[str, StoredCampaignResult] = {}
        
        self.load_data()

    def load_data(self):
        """Load data from files"""
        try:
            if self.campaigns_file.exists():
                with open(self.campaigns_file, 'r') as f:
                    campaigns_data = json.load(f)
                    for campaign_id, campaign_data in campaigns_data.items():
                        # Convert created_at string back to datetime
                        if 'created_at' in campaign_data:
                            campaign_data['created_at'] = datetime.fromisoformat(campaign_data['created_at'])
                        self.campaigns[campaign_id] = campaign_data

            if self.results_file.exists():
                with open(self.results_file, 'r') as f:
                    results_data = json.load(f)
                    for campaign_id, result_data in results_data.items():
                        self.results[campaign_id] = StoredCampaignResult.from_dict(result_data)
        except Exception as e:
            print(f"Warning: Failed to load storage data: {e}")

    def save_data(self):
        """Save data to files"""
        try:
            # Save campaigns
            campaigns_data = {}
            for campaign_id, campaign in self.campaigns.items():
                if isinstance(campaign, dict):
                    campaign_data = campaign.copy()
                    if 'created_at' in campaign_data and isinstance(campaign_data['created_at'], datetime):
                        campaign_data['created_at'] = campaign_data['created_at'].isoformat()
                    campaigns_data[campaign_id] = campaign_data
                else:
                    campaigns_data[campaign_id] = campaign

            with open(self.campaigns_file, 'w') as f:
                json.dump(campaigns_data, f, indent=2, default=str)

            # Save results
            results_data = {}
            for campaign_id, result in self.results.items():
                results_data[campaign_id] = result.to_dict()

            with open(self.results_file, 'w') as f:
                json.dump(results_data, f, indent=2, default=str)
        except Exception as e:
            print(f"Warning: Failed to save storage data: {e}")

    def initialize(self):
        """Initialize storage"""
        print("Initializing file storage...")
        self.load_data()

    # Campaign operations
    def save_campaign(self, campaign: Any) -> None:
        """Save a campaign"""
        campaign_id = campaign.get('id') if isinstance(campaign, dict) else getattr(campaign, 'id')
        self.campaigns[campaign_id] = campaign
        self.save_data()

    def get_campaign(self, campaign_id: str) -> Optional[Any]:
        """Get a campaign by ID"""
        return self.campaigns.get(campaign_id)

    def get_all_campaigns(self) -> List[Any]:
        """Get all campaigns"""
        return list(self.campaigns.values())

    def delete_campaign(self, campaign_id: str) -> bool:
        """Delete a campaign and its results"""
        deleted = campaign_id in self.campaigns
        if deleted:
            del self.campaigns[campaign_id]
            if campaign_id in self.results:
                del self.results[campaign_id]
            self.save_data()
        return deleted

    # Results operations
    def save_results(self, campaign_id: str, campaign: Any, 
                    simulation: Any, optimization: List[Any]) -> None:
        """Save campaign results"""
        result = StoredCampaignResult(
            campaign_id=campaign_id,
            campaign=campaign,
            simulation=simulation,
            optimization=optimization
        )
        self.results[campaign_id] = result
        self.save_data()

    def get_results(self, campaign_id: str) -> Optional[StoredCampaignResult]:
        """Get results for a campaign"""
        return self.results.get(campaign_id)

    def get_all_results(self) -> List[StoredCampaignResult]:
        """Get all results"""
        return list(self.results.values())

    def delete_results(self, campaign_id: str) -> bool:
        """Delete results for a campaign"""
        deleted = campaign_id in self.results
        if deleted:
            del self.results[campaign_id]
            self.save_data()
        return deleted

    # Statistics
    def get_stats(self) -> Dict:
        """Get storage statistics"""
        recent_results = sorted(
            self.results.values(),
            key=lambda x: x.created_at,
            reverse=True
        )[:5]
        
        return {
            "total_campaigns": len(self.campaigns),
            "total_results": len(self.results),
            "recent_campaigns": [r.to_dict() for r in recent_results]
        }

    # Data management
    def clear(self) -> None:
        """Clear all data"""
        self.campaigns.clear()
        self.results.clear()
        self.save_data()

    def export_all_data(self) -> Dict:
        """Export all data"""
        return {
            "campaigns": list(self.campaigns.values()),
            "results": [r.to_dict() for r in self.results.values()]
        }

    def import_data(self, data: Dict) -> None:
        """Import data"""
        if 'campaigns' in data:
            for campaign in data['campaigns']:
                campaign_id = campaign.get('id')
                if campaign_id:
                    if 'created_at' in campaign and isinstance(campaign['created_at'], str):
                        campaign['created_at'] = datetime.fromisoformat(campaign['created_at'])
                    self.campaigns[campaign_id] = campaign

        if 'results' in data:
            for result_data in data['results']:
                if isinstance(result_data, dict) and 'campaign_id' in result_data:
                    result = StoredCampaignResult.from_dict(result_data)
                    self.results[result.campaign_id] = result

        self.save_data()

# Create singleton instance
storage = FileStorage()