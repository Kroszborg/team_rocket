export interface Campaign {
  id: string;
  name: string;
  product: ProductDetails;
  targeting: TargetDemographics;
  budget: BudgetAllocation;
  channels: ChannelPreferences;
  creatives: Creative[];
  createdAt: Date;
}

export interface ProductDetails {
  name: string;
  category: string;
  price: number;
  description: string;
  targetMargin: number;
}

export interface TargetDemographics {
  ageRange: {
    min: number;
    max: number;
  };
  gender: 'male' | 'female' | 'all';
  interests: string[];
  location: string[];
  income: 'low' | 'medium' | 'high' | 'all';
}

export interface BudgetAllocation {
  total: number;
  duration: number; // days
  channels: {
    [key in MarketingChannel]: number;
  };
}

export interface ChannelPreferences {
  preferred: MarketingChannel[];
  avoided: MarketingChannel[];
}

export type MarketingChannel = 
  | 'facebook'
  | 'instagram' 
  | 'google-ads'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'twitter'
  | 'email'
  | 'seo'
  | 'influencer';

export interface Creative {
  id: string;
  title: string;
  description: string;
  callToAction: string;
  channel: MarketingChannel;
  score?: CreativeScore;
}

export interface CreativeScore {
  overall: number;
  breakdown: {
    clarity: number;
    urgency: number;
    relevance: number;
    callToAction: number;
  };
  suggestions: string[];
}

export interface SimulationResults {
  campaignId: string;
  metrics: {
    estimatedReach: number;
    estimatedEngagement: number;
    estimatedConversions: number;
    estimatedROI: number;
    costPerConversion: number;
  };
  channelBreakdown: {
    [key in MarketingChannel]: {
      spend: number;
      reach: number;
      conversions: number;
      roi: number;
    };
  };
  timeline: {
    day: number;
    reach: number;
    conversions: number;
    spend: number;
  }[];
}

export interface OptimizationSuggestion {
  type: 'budget_reallocation' | 'channel_addition' | 'creative_improvement';
  title: string;
  description: string;
  impact: {
    roi_increase: number;
    reach_increase: number;
    conversion_increase: number;
  };
  changes: {
    from_channel?: MarketingChannel;
    to_channel?: MarketingChannel;
    amount?: number;
    creative_changes?: string[];
  };
}