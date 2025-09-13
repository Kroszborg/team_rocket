import { Campaign, OptimizationSuggestion, Creative, CreativeScore } from '@/lib/types';

// ML Service configuration
const ML_SERVICE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CampaignOptimizationRequest {
  total_budget: number;
  aov: number;
  age: number;
  gender: string;
  income_level: string;
  creative_quality: number;
  campaign_days: number;
  target_margin: number;
}

interface CampaignOptimizationResponse {
  recommended_split: Record<string, number>;
  predicted_revenue: number;
  predicted_roi: number;
  confidence_score: number;
  warning?: string;
}

interface CreativeScoreRequest {
  channel: string;
  title: string;
  description: string;
  cta: string;
}

interface CreativeScoreResponse {
  channel: string;
  scores: {
    title: number;
    description: number;
    cta: number;
    channel_fit: number;
    final: number;
  };
  feedback: string[];
  improvements: Record<string, string[]>;
}

class MLServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'MLServiceError';
  }
}

async function callMLService<T>(endpoint: string, data?: any): Promise<T> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}${endpoint}`, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new MLServiceError(
        `ML Service error: ${response.status} ${errorText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof MLServiceError) {
      throw error;
    }
    throw new MLServiceError(`Failed to connect to ML service: ${error}`);
  }
}

export async function optimizeCampaignBudget(campaign: Campaign): Promise<{
  optimizedBudget: Record<string, number>;
  predictions: {
    revenue: number;
    roi: number;
    confidence: number;
  };
  suggestions: OptimizationSuggestion[];
}> {
  // Map campaign data to ML service format
  const avgAge = (campaign.targeting.ageRange.min + campaign.targeting.ageRange.max) / 2;
  
  // Map gender values
  const genderMap: Record<string, string> = {
    'male': 'man',
    'female': 'woman',
    'all': 'all'
  };
  
  // Map income values
  const incomeMap: Record<string, string> = {
    'low': 'low',
    'medium': 'high', // Map medium to high for ML model
    'high': 'high',
    'all': 'high' // Default to high
  };

  // Estimate creative quality based on campaign creatives
  let creativeQuality = 0.7; // Default
  if (campaign.creatives && campaign.creatives.length > 0) {
    const avgScore = campaign.creatives.reduce((sum, creative) => {
      return sum + (creative.score?.overall || 70);
    }, 0) / campaign.creatives.length;
    creativeQuality = avgScore / 100;
  }

  const request: CampaignOptimizationRequest = {
    total_budget: campaign.budget.total,
    aov: campaign.product.price,
    age: avgAge,
    gender: genderMap[campaign.targeting.gender] || 'all',
    income_level: incomeMap[campaign.targeting.income] || 'high',
    creative_quality: creativeQuality,
    campaign_days: campaign.budget.duration,
    target_margin: campaign.product.targetMargin / 100, // Convert percentage to decimal
  };

  const response = await callMLService<CampaignOptimizationResponse>('/api/ml/campaign/optimize', request);

  // Convert response to application format
  const channelMapping: Record<string, string> = {
    'instagram': 'instagram',
    'google': 'google-ads',
    'tiktok': 'tiktok',
    'facebook': 'facebook',
    'youtube': 'youtube',
    'linkedin': 'linkedin'
  };

  const optimizedBudget: Record<string, number> = {};
  for (const [mlChannel, amount] of Object.entries(response.recommended_split)) {
    const appChannel = channelMapping[mlChannel];
    if (appChannel) {
      optimizedBudget[appChannel] = amount;
    }
  }

  // Generate optimization suggestions based on ML results
  const suggestions: OptimizationSuggestion[] = [];
  
  // Compare current vs optimal allocation
  const currentAllocation = campaign.budget.channels;
  for (const [channel, optimalAmount] of Object.entries(optimizedBudget)) {
    const currentAmount = currentAllocation[channel as keyof typeof currentAllocation] || 0;
    const difference = optimalAmount - currentAmount;
    
    if (Math.abs(difference) > campaign.budget.total * 0.05) { // 5% threshold
      suggestions.push({
        type: 'budget_reallocation',
        title: difference > 0 ? `Increase ${channel} budget` : `Decrease ${channel} budget`,
        description: difference > 0 
          ? `Increase budget allocation to ${channel} by $${Math.abs(difference).toFixed(2)} for better ROI`
          : `Reduce budget allocation from ${channel} by $${Math.abs(difference).toFixed(2)} and reallocate`,
        impact: {
          roi_increase: response.predicted_roi * 100 * (Math.abs(difference) / campaign.budget.total),
          reach_increase: 10 * (Math.abs(difference) / campaign.budget.total),
          conversion_increase: 8 * (Math.abs(difference) / campaign.budget.total),
        },
        changes: {
          to_channel: difference > 0 ? channel as any : undefined,
          from_channel: difference < 0 ? channel as any : undefined,
          amount: Math.abs(difference),
        },
      });
    }
  }

  return {
    optimizedBudget,
    predictions: {
      revenue: response.predicted_revenue,
      roi: response.predicted_roi,
      confidence: response.confidence_score,
    },
    suggestions,
  };
}

export async function scoreCreativeWithML(creative: Creative): Promise<CreativeScore> {
  // Map channel names for ML service
  const channelMapping: Record<string, string> = {
    'instagram': 'instagram',
    'google-ads': 'google',
    'tiktok': 'tiktok',
    'facebook': 'facebook',
    'youtube': 'youtube',
    'linkedin': 'linkedin',
    'twitter': 'twitter',
    'email': 'email'
  };

  const request: CreativeScoreRequest = {
    channel: channelMapping[creative.channel] || creative.channel,
    title: creative.title,
    description: creative.description,
    cta: creative.callToAction,
  };

  const response = await callMLService<CreativeScoreResponse>('/api/ml/creative/score', request);

  // Convert ML response to application format
  const score: CreativeScore = {
    overall: response.scores.final,
    breakdown: {
      clarity: response.scores.title,
      urgency: response.scores.description,
      relevance: response.scores.channel_fit,
      callToAction: response.scores.cta,
    },
    suggestions: [
      ...response.feedback,
      ...(response.improvements.title || []),
      ...(response.improvements.description || []),
      ...(response.improvements.cta || []),
    ],
  };

  return score;
}

export async function generateCreativeImprovements(
  channel: string,
  title: string,
  description: string,
  cta: string
): Promise<{
  titleSuggestions: string[];
  descriptionSuggestions: string[];
  ctaSuggestions: string[];
  overallScore: number;
}> {
  const channelMapping: Record<string, string> = {
    'instagram': 'instagram',
    'google-ads': 'google',
    'tiktok': 'tiktok',
    'facebook': 'facebook',
    'youtube': 'youtube',
    'linkedin': 'linkedin',
    'twitter': 'twitter',
    'email': 'email'
  };

  const request: CreativeScoreRequest = {
    channel: channelMapping[channel] || channel,
    title,
    description,
    cta,
  };

  const response = await callMLService<CreativeScoreResponse>('/api/ml/creative/score', request);

  return {
    titleSuggestions: response.improvements.title || [],
    descriptionSuggestions: response.improvements.description || [],
    ctaSuggestions: response.improvements.cta || [],
    overallScore: response.scores.final,
  };
}

// Health check for ML service
export async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const response = await callMLService<{ status: string }>('/api/ml/health');
    return response.status === 'healthy' || response.status === 'degraded';
  } catch (error) {
    console.warn('ML Service health check failed:', error);
    return false;
  }
}

// Fallback functions when ML service is unavailable
export async function optimizeCampaignBudgetFallback(campaign: Campaign): Promise<{
  optimizedBudget: Record<string, number>;
  predictions: { revenue: number; roi: number; confidence: number };
  suggestions: OptimizationSuggestion[];
}> {
  // Simple rule-based optimization as fallback
  const totalBudget = campaign.budget.total;
  const numChannels = campaign.channels.preferred.length || 6;
  const equalAllocation = totalBudget / numChannels;

  const optimizedBudget: Record<string, number> = {};
  campaign.channels.preferred.forEach(channel => {
    optimizedBudget[channel] = equalAllocation;
  });

  // If no preferred channels, use default allocation
  if (campaign.channels.preferred.length === 0) {
    optimizedBudget['google-ads'] = totalBudget * 0.3;
    optimizedBudget['facebook'] = totalBudget * 0.25;
    optimizedBudget['instagram'] = totalBudget * 0.25;
    optimizedBudget['youtube'] = totalBudget * 0.2;
  }

  return {
    optimizedBudget,
    predictions: {
      revenue: totalBudget * 2.5, // Simple 2.5x revenue estimate
      roi: 1.5, // 150% ROI estimate
      confidence: 0.6, // Lower confidence for fallback
    },
    suggestions: [{
      type: 'creative_improvement',
      title: 'Improve creative quality',
      description: 'Consider A/B testing your ad creatives to improve performance',
      impact: {
        roi_increase: 15,
        reach_increase: 10,
        conversion_increase: 12,
      },
      changes: {
        creative_changes: ['Test different headlines', 'Improve call-to-action']
      },
    }],
  };
}