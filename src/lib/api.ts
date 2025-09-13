// Centralized API configuration for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

import { 
  RegisterData, 
  LoginCredentials, 
  ProfileData, 
  CampaignData, 
  CreativeData, 
  OptimizationData,
  // Response Types
  AuthApiResponse,
  LoginResponse,
  CampaignsResponse,
  CampaignDetailResponse,
  CreativeHistoryResponse,
  HealthCheckResponse,
  MLHealthCheckResponse,
  UserStatsResponse
} from './types';

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`API Error ${response.status}: ${errorData.detail || 'Unknown error'}`);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);

    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth APIs
  async register(userData: RegisterData) {
    return this.request<AuthApiResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginCredentials) {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request<AuthApiResponse>('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request<AuthApiResponse>('/api/auth/me');
  }

  // Profile APIs
  async getProfile() {
    return this.request<ProfileData>('/api/profile');
  }

  async updateProfile(profileData: ProfileData) {
    return this.request<AuthApiResponse>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Creative APIs
  async getCreativeHistory() {
    return this.request<CreativeHistoryResponse>('/api/creative/history');
  }

  // Campaign APIs
  async createCampaign(campaignData: CampaignData) {
    return this.request<CampaignDetailResponse>('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getCampaigns(limit = 10, offset = 0) {
    return this.request<CampaignsResponse>(`/api/campaigns?limit=${limit}&offset=${offset}`);
  }

  async getCampaign(campaignId: string) {
    return this.request<CampaignDetailResponse>(`/api/campaigns/${campaignId}`);
  }

  async deleteCampaign(campaignId: string) {
    return this.request<AuthApiResponse>(`/api/campaigns/${campaignId}`, {
      method: 'DELETE',
    });
  }

  async getCampaignResults(campaignId: string) {
    return this.request<any>(`/api/campaigns/${campaignId}/results`); // Define specific type later
  }

  // Creative APIs
  async scoreCreative(creativeData: CreativeData) {
    return this.request<any>('/api/creative/score', { // Define specific type later
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
    return this.request<any>(`/api/creative/suggestions?${params}`); // Define specific type later
  }

  // ML APIs
  async optimizeCampaign(optimizationData: OptimizationData) {
    return this.request<any>('/api/ml/campaign/optimize', { // Define specific type later
      method: 'POST',
      body: JSON.stringify(optimizationData),
    });
  }

  async scoreCreativeML(creativeData: CreativeData) {
    return this.request<any>('/api/ml/creative/score', { // Define specific type later
      method: 'POST',
      body: JSON.stringify(creativeData),
    });
  }

  // Health checks
  async checkHealth() {
    return this.request<HealthCheckResponse>('/health');
  }

  async checkMLHealth() {
    return this.request<MLHealthCheckResponse>('/api/ml/health');
  }

  // Stats APIs
  async getStats() {
    return this.request<UserStatsResponse>('/api/dashboard/stats');
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