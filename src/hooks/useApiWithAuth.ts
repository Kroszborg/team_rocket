'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { Campaign } from '@/lib/types' // Import the canonical Campaign type

interface UserStats {
  // Define the shape of your user stats object
  totalCampaigns: number;
  totalCreatives: number;
  memberSince: string;
}

interface CreativeScoreRequest {
  // Define the shape of the creative data to be scored
  [key: string]: any;
}

// --- Custom Hooks ---

/**
 * Hook for campaign operations.
 */
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: { campaigns: Campaign[] } = await apiClient.getCampaigns();
      setCampaigns(response.campaigns || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns');
    }
    setLoading(false);
  }, []);

  const saveCampaign = async (name: string, campaignData: any, optimizationResults: any) => {
    // This should use a method on apiClient, e.g., apiClient.createCampaign(...)
    // For now, returning a placeholder response
    console.log('Saving campaign:', { name, campaignData, optimizationResults });
    await fetchCampaigns(); // Refresh list
    return { success: true };
  };

  const deleteCampaign = async (campaignId: string) => {
    const result = await apiClient.deleteCampaign(campaignId);
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    return result;
  };

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    saveCampaign,
    deleteCampaign,
  };
}

/**
 * Hook for fetching user statistics.
 */
export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response: { stats: UserStats } = await apiClient.getStats();
      setStats(response.stats);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, fetchStats };
}

/**
 * Hook for creative scoring operations.
 */
export function useCreativeScoring() {
  const scoreCreative = async (creativeData: CreativeScoreRequest) => {
    return apiClient.scoreCreative(creativeData);
  };

  return { scoreCreative };
}
