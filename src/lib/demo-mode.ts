/**
 * Demo Mode - Standalone functionality for hackathon presentation
 * Works without backend dependencies
 */

import { Campaign, SimulationResults, OptimizationSuggestion, CreativeScore } from './types';

// Enable demo mode when backend is unavailable
const DEMO_MODE = !process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const demoMode = {
  enabled: DEMO_MODE,

  // Generate realistic demo campaign results
  generateCampaignResults: (campaign: any, existingId?: string): {
    success: boolean,
    campaign_id: string,
    message: string,
    stats: any
  } => {
    // Use existing ID if provided, otherwise generate demo ID
    const campaignId = existingId || `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate realistic performance based on budget and channels
    const totalBudget = campaign.budget?.total || 1000;
    const duration = campaign.budget?.duration || 30;

    // Calculate metrics based on campaign data
    const dailyBudget = totalBudget / duration;
    const estimatedReach = Math.floor(dailyBudget * 15 * (0.8 + Math.random() * 0.4)); // 12-21x daily budget
    const estimatedConversions = Math.floor(estimatedReach * (0.02 + Math.random() * 0.03)); // 2-5% conversion
    const estimatedRevenue = estimatedConversions * (campaign.product?.price || 50);
    const roi = ((estimatedRevenue - totalBudget) / totalBudget) * 100;

    return {
      success: true,
      campaign_id: campaignId,
      message: "Campaign created and simulation completed successfully",
      stats: {
        reach: estimatedReach,
        roi: Math.round(roi * 10) / 10,
        conversions: estimatedConversions
      }
    };
  },

  // Generate demo optimization suggestions
  generateOptimizationSuggestions: (campaign: any): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [
      {
        type: "budget_reallocation",
        title: "🎯 Optimize Channel Budget",
        description: "Reallocate 15% more budget to Google Ads for higher conversion rates",
        impact: {
          roiIncrease: 12,
          reachIncrease: 8,
          conversionIncrease: 15
        }
      },
      {
        type: "targeting_refinement",
        title: "🎪 Refine Target Audience",
        description: "Focus on 25-35 age group showing 23% higher engagement",
        impact: {
          roiIncrease: 8,
          reachIncrease: -5,
          conversionIncrease: 18
        }
      },
      {
        type: "creative_optimization",
        title: "✨ Enhance Ad Creative",
        description: "A/B test urgency-based headlines to improve click-through rates",
        impact: {
          roiIncrease: 6,
          reachIncrease: 0,
          conversionIncrease: 12
        }
      },
      {
        type: "ai_recommendation",
        title: "🤖 AI Strategic Insight",
        description: "Consider Instagram Reels for this demographic - 34% higher engagement than feed posts",
        impact: {
          roiIncrease: 15,
          reachIncrease: 25,
          conversionIncrease: 20
        }
      }
    ];

    return suggestions;
  },

  // Generate demo simulation results
  generateSimulationResults: (campaign: any): SimulationResults => {
    const totalBudget = campaign.budget?.total || 1000;
    const duration = campaign.budget?.duration || 30;

    return {
      campaignId: `demo_${Date.now()}`,
      performance: {
        reach: Math.floor(totalBudget * 12),
        impressions: Math.floor(totalBudget * 45),
        clicks: Math.floor(totalBudget * 2.3),
        conversions: Math.floor(totalBudget * 0.08),
        revenue: Math.floor(totalBudget * 2.2),
        roi: 1.2 + Math.random() * 0.8
      },
      channelBreakdown: {
        'google-ads': { spend: totalBudget * 0.35, conversions: Math.floor(totalBudget * 0.03), roi: 1.8 },
        'facebook': { spend: totalBudget * 0.25, conversions: Math.floor(totalBudget * 0.02), roi: 1.4 },
        'instagram': { spend: totalBudget * 0.20, conversions: Math.floor(totalBudget * 0.015), roi: 1.2 },
        'youtube': { spend: totalBudget * 0.15, conversions: Math.floor(totalBudget * 0.01), roi: 1.1 },
        'linkedin': { spend: totalBudget * 0.05, conversions: Math.floor(totalBudget * 0.005), roi: 0.9 }
      },
      timeline: Array.from({ length: Math.min(30, duration) }, (_, i) => ({
        day: i + 1,
        spend: totalBudget / duration,
        revenue: (totalBudget * 2.2) / duration,
        conversions: Math.floor((totalBudget * 0.08) / duration)
      }))
    };
  },

  // Generate demo creative score
  generateCreativeScore: (creative: any): CreativeScore => {
    const titleScore = Math.min(100, (creative.title?.length || 0) * 2 + 60 + Math.random() * 20);
    const descScore = Math.min(100, Math.max(40, (creative.description?.length || 0) * 0.8 + 50 + Math.random() * 20));
    const ctaScore = creative.callToAction ? 80 + Math.random() * 20 : 40 + Math.random() * 20;
    const relevanceScore = 70 + Math.random() * 25;

    const overallScore = Math.round((titleScore + descScore + ctaScore + relevanceScore) / 4);

    const suggestions = [];
    if (titleScore < 70) suggestions.push("Consider making your headline more compelling and benefit-focused");
    if (descScore < 70) suggestions.push("Add more specific benefits and social proof to your description");
    if (ctaScore < 70) suggestions.push("Use a stronger, more action-oriented call-to-action");
    if (suggestions.length === 0) suggestions.push("Excellent creative! Consider A/B testing minor variations");

    return {
      overall: overallScore,
      breakdown: {
        clarity: Math.round(titleScore),
        urgency: Math.round(descScore),
        relevance: Math.round(relevanceScore),
        callToAction: Math.round(ctaScore)
      },
      suggestions: suggestions.slice(0, 3)
    };
  },

  // Get stored campaign (from localStorage in demo mode)
  getCampaignResults: (campaignId: string) => {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(`demo_campaign_${campaignId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    // Generate mock campaign data if not found
    const mockCampaign = {
      id: campaignId,
      name: "Demo Campaign",
      product: { name: "Premium Product", price: 99 },
      budget: { total: 1000, duration: 30 },
      targeting: { ageRange: { min: 25, max: 45 } },
      channels: { preferred: ["google-ads", "facebook"] }
    };

    const results = {
      campaign: mockCampaign,
      simulation: demoMode.generateSimulationResults(mockCampaign),
      optimization: demoMode.generateOptimizationSuggestions(mockCampaign)
    };

    // Store for consistency
    localStorage.setItem(`demo_campaign_${campaignId}`, JSON.stringify(results));
    return results;
  },

  // Store campaign results in demo mode
  storeCampaignResults: (campaignId: string, data: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`demo_campaign_${campaignId}`, JSON.stringify(data));
  }
};

export default demoMode;