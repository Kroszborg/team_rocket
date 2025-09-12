// Enhanced storage with browser persistence
import { Campaign, SimulationResults, OptimizationSuggestion } from './types';

interface StoredCampaignResult {
  campaignId: string;
  campaign: Campaign;
  simulation: SimulationResults;
  optimization: OptimizationSuggestion[];
  createdAt: Date;
}

class InMemoryStorage {
  private campaigns: Map<string, Campaign> = new Map();
  private results: Map<string, StoredCampaignResult> = new Map();
  private isClient = typeof window !== 'undefined';

  constructor() {
    // Load from localStorage on client-side initialization
    if (this.isClient) {
      this.loadFromLocalStorage();
    }
  }

  // Browser storage methods
  private loadFromLocalStorage(): void {
    try {
      const campaignsData = localStorage.getItem('vcl-campaigns');
      const resultsData = localStorage.getItem('vcl-results');

      if (campaignsData) {
        const campaigns = JSON.parse(campaignsData);
        campaigns.forEach((campaign: Campaign) => {
          // Convert date strings back to Date objects
          campaign.createdAt = new Date(campaign.createdAt);
          this.campaigns.set(campaign.id, campaign);
        });
      }

      if (resultsData) {
        const results = JSON.parse(resultsData);
        results.forEach((result: StoredCampaignResult) => {
          // Convert date strings back to Date objects
          result.createdAt = new Date(result.createdAt);
          result.campaign.createdAt = new Date(result.campaign.createdAt);
          this.results.set(result.campaignId, result);
        });
      }
    } catch (error) {
      console.warn('Failed to load data from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    if (!this.isClient) return;
    
    try {
      const campaigns = Array.from(this.campaigns.values());
      const results = Array.from(this.results.values());
      
      localStorage.setItem('vcl-campaigns', JSON.stringify(campaigns));
      localStorage.setItem('vcl-results', JSON.stringify(results));
    } catch (error) {
      console.warn('Failed to save data to localStorage:', error);
    }
  }

  // Campaign operations
  saveCampaign(campaign: Campaign): void {
    this.campaigns.set(campaign.id, campaign);
    this.saveToLocalStorage();
  }

  getCampaign(id: string): Campaign | null {
    return this.campaigns.get(id) || null;
  }

  getAllCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  deleteCampaign(id: string): boolean {
    const deleted = this.campaigns.delete(id);
    this.results.delete(id); // Also delete associated results
    this.saveToLocalStorage();
    return deleted;
  }

  // Results operations
  saveResults(
    campaignId: string,
    campaign: Campaign,
    simulation: SimulationResults,
    optimization: OptimizationSuggestion[]
  ): void {
    const result: StoredCampaignResult = {
      campaignId,
      campaign,
      simulation,
      optimization,
      createdAt: new Date(),
    };
    this.results.set(campaignId, result);
    this.saveToLocalStorage();
  }

  getResults(campaignId: string): StoredCampaignResult | null {
    return this.results.get(campaignId) || null;
  }

  getAllResults(): StoredCampaignResult[] {
    return Array.from(this.results.values());
  }

  deleteResults(campaignId: string): boolean {
    const deleted = this.results.delete(campaignId);
    this.saveToLocalStorage();
    return deleted;
  }

  // Statistics
  getStats() {
    return {
      totalCampaigns: this.campaigns.size,
      totalResults: this.results.size,
      recentCampaigns: Array.from(this.results.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
    };
  }

  // Clear all data (for testing)
  clear(): void {
    this.campaigns.clear();
    this.results.clear();
    this.saveToLocalStorage();
  }

  // Data management utilities
  exportAllData(): { campaigns: Campaign[], results: StoredCampaignResult[] } {
    return {
      campaigns: Array.from(this.campaigns.values()),
      results: Array.from(this.results.values()),
    };
  }

  importData(data: { campaigns?: Campaign[], results?: StoredCampaignResult[] }): void {
    if (data.campaigns) {
      data.campaigns.forEach(campaign => {
        campaign.createdAt = new Date(campaign.createdAt);
        this.campaigns.set(campaign.id, campaign);
      });
    }
    
    if (data.results) {
      data.results.forEach(result => {
        result.createdAt = new Date(result.createdAt);
        result.campaign.createdAt = new Date(result.campaign.createdAt);
        this.results.set(result.campaignId, result);
      });
    }
    
    this.saveToLocalStorage();
  }
}

// Singleton instance
export const storage = new InMemoryStorage();

// Export types
export type { StoredCampaignResult };