// Centralized API configuration for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Campaign APIs
  async createCampaign(campaignData: any) {
    return this.request('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getCampaigns(limit = 10, offset = 0) {
    return this.request(`/api/campaigns?limit=${limit}&offset=${offset}`);
  }

  async getCampaign(campaignId: string) {
    return this.request(`/api/campaigns/${campaignId}`);
  }

  async deleteCampaign(campaignId: string) {
    return this.request(`/api/campaigns/${campaignId}`, {
      method: 'DELETE',
    });
  }

  async getCampaignResults(campaignId: string) {
    return this.request(`/api/campaigns/${campaignId}/results`);
  }

  // Creative APIs
  async scoreCreative(creativeData: any) {
    return this.request('/api/creative/score', {
      method: 'POST',
      body: JSON.stringify(creativeData),
    });
  }

  async getCreativeSuggestions(channel: string, productName: string, category: string) {
    const params = new URLSearchParams({
      channel,
      product_name: productName,
      category,
    });
    return this.request(`/api/creative/suggestions?${params}`);
  }

  // ML APIs
  async optimizeCampaign(optimizationData: any) {
    return this.request('/api/ml/campaign/optimize', {
      method: 'POST',
      body: JSON.stringify(optimizationData),
    });
  }

  async scoreCreativeML(creativeData: any) {
    return this.request('/api/ml/creative/score', {
      method: 'POST',
      body: JSON.stringify(creativeData),
    });
  }

  // Health checks
  async checkHealth() {
    return this.request('/health');
  }

  async checkMLHealth() {
    return this.request('/api/ml/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or multiple instances
export { ApiClient };

// Helper function to check if backend is available
export async function isBackendAvailable(): Promise<boolean> {
  try {
    await apiClient.checkHealth();
    return true;
  } catch {
    return false;
  }
}

// Helper function to check if ML features are available
export async function areMLFeaturesAvailable(): Promise<boolean> {
  try {
    const health = await apiClient.checkMLHealth();
    return health.models?.models_loaded === true;
  } catch {
    return false;
  }
}