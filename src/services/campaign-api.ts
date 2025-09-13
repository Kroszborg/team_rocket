import { Campaign } from '@/lib/types';
import { apiClient, isBackendAvailable } from '@/lib/api';

export const createCampaign = async (campaignData: any) => {
  // Check if backend is available
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      // Use backend API
      return await apiClient.createCampaign(campaignData);
    } catch (error) {
      console.warn('Backend campaign creation failed, falling back to local API:', error);
    }
  }

  // Fallback to local Next.js API
  const response = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaignData),
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create campaign');
  }

  return data;
};

export const getCampaigns = async (limit = 10, offset = 0) => {
  // Check if backend is available
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      // Use backend API
      return await apiClient.getCampaigns(limit, offset);
    } catch (error) {
      console.warn('Backend get campaigns failed, falling back to local API:', error);
    }
  }

  // Fallback to local Next.js API
  const response = await fetch(`/api/campaigns?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to get campaigns');
  }

  return data;
};

export const getCampaign = async (campaignId: string) => {
  // Check if backend is available
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      // Use backend API
      return await apiClient.getCampaign(campaignId);
    } catch (error) {
      console.warn('Backend get campaign failed, falling back to local API:', error);
    }
  }

  // Fallback to local Next.js API
  const response = await fetch(`/api/campaigns/${campaignId}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to get campaign');
  }

  return data;
};

export const deleteCampaign = async (campaignId: string) => {
  // Check if backend is available
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      // Use backend API
      return await apiClient.deleteCampaign(campaignId);
    } catch (error) {
      console.warn('Backend delete campaign failed, falling back to local API:', error);
    }
  }

  // Fallback to local Next.js API
  const response = await fetch(`/api/campaigns/${campaignId}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete campaign');
  }

  return data;
};

export const getCampaignResults = async (campaignId: string) => {
  // Check if backend is available
  const backendAvailable = await isBackendAvailable();
  
  if (backendAvailable) {
    try {
      // Use backend API
      return await apiClient.getCampaignResults(campaignId);
    } catch (error) {
      console.warn('Backend get results failed, falling back to local API:', error);
    }
  }

  // Fallback to local Next.js API
  const response = await fetch(`/api/campaigns/${campaignId}/results`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to get campaign results');
  }

  return data;
};