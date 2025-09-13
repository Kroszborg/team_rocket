'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function useApiWithAuth() {
  const { session } = useAuth()

  const makeRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers
      }

      // Add authorization header if user is authenticated
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`
        }
      }

      return {
        success: true,
        data: data.data || data
      }
    } catch (error) {
      console.error('API request error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  return { makeRequest }
}

// Hook for campaign operations
export function useCampaigns() {
  const { makeRequest } = useApiWithAuth()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = async () => {
    setLoading(true)
    setError(null)
    
    const result = await makeRequest<{ campaigns: any[] }>('/api/dashboard/campaigns')
    
    if (result.success && result.data) {
      setCampaigns(result.data.campaigns || [])
    } else {
      setError(result.error || 'Failed to fetch campaigns')
    }
    
    setLoading(false)
  }

  const saveCampaign = async (name: string, campaignData: any, optimizationResults: any) => {
    const result = await makeRequest('/api/dashboard/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        name,
        campaign_data: campaignData,
        optimization_results: optimizationResults
      })
    })

    if (result.success) {
      // Refresh campaigns list
      await fetchCampaigns()
    }

    return result
  }

  const deleteCampaign = async (campaignId: string) => {
    const result = await makeRequest(`/api/dashboard/campaigns/${campaignId}`, {
      method: 'DELETE'
    })

    if (result.success) {
      // Remove from local state
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
    }

    return result
  }

  const optimizeCampaign = async (campaignData: any) => {
    return makeRequest('/api/campaigns/optimize', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    })
  }

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    saveCampaign,
    deleteCampaign,
    optimizeCampaign
  }
}

// Hook for user stats
export function useUserStats() {
  const { makeRequest } = useApiWithAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    
    const result = await makeRequest<{ stats: any }>('/api/dashboard/stats')
    
    if (result.success && result.data) {
      setStats(result.data.stats)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, fetchStats }
}

// Hook for creative scoring
export function useCreativeScoring() {
  const { makeRequest } = useApiWithAuth()

  const scoreCreative = async (creativeData: any) => {
    return makeRequest('/api/creative/score', {
      method: 'POST',
      body: JSON.stringify(creativeData)
    })
  }

  return { scoreCreative }
}