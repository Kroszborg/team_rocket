export interface Campaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
  product: ProductDetails;
  targeting: TargetDemographics;
  budget: BudgetAllocation;
  channels: ChannelPreferences;
  creatives: Creative[];
  optimization_results?: any; // TODO: Define this type
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
  channels: Record<string, number>;
}

export interface ChannelPreferences {
  preferred: string[];
  avoided: string[];
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
  created_at?: string;
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

// --- API Data Types ---

export interface RegisterData {
  email: string;
  password?: string;
  full_name?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface ProfileData {
  full_name: string;
  company?: string;
  role?: string;
}

export interface CampaignData {
  // Define the shape for creating a new campaign
  name: string;
  // Add other properties as needed
}

export interface CreativeData {
  // Define the shape for scoring a creative
  [key: string]: any; // Placeholder
}

export interface OptimizationData {
  // Define the shape for campaign optimization
  [key: string]: any; // Placeholder
}

// --- API Response Types ---

export interface AuthApiResponse {
  success: boolean;
  user?: any; // Define user type later
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  access_token: string;
  user: BackendUser;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  error?: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
}

export interface CampaignDetailResponse {
  campaign: Campaign;
}

export interface CreativeHistoryResponse {
  tests: Creative[];
}

export interface HealthCheckResponse {
  status: string;
}

export interface MLHealthCheckResponse {
  models?: { models_loaded?: boolean };
}

export interface UserStats {
  totalCampaigns: number;
  totalCreatives: number;
  memberSince: string;
}

export interface UserStatsResponse {
  stats: UserStats;
}

export interface BackendUser {
  id: string;
  email: string;
  full_name?: string;
}