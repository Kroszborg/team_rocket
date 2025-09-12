import { Campaign, SimulationResults, MarketingChannel } from './types';

// Channel performance multipliers based on industry data
const CHANNEL_METRICS = {
  facebook: { reach_rate: 0.12, engagement_rate: 0.018, conversion_rate: 0.009, cpc: 1.72 },
  instagram: { reach_rate: 0.08, engagement_rate: 0.058, conversion_rate: 0.007, cpc: 3.56 },
  'google-ads': { reach_rate: 0.35, engagement_rate: 0.036, conversion_rate: 0.039, cpc: 2.69 },
  tiktok: { reach_rate: 0.15, engagement_rate: 0.054, conversion_rate: 0.006, cpc: 1.00 },
  youtube: { reach_rate: 0.20, engagement_rate: 0.018, conversion_rate: 0.013, cpc: 3.21 },
  linkedin: { reach_rate: 0.06, engagement_rate: 0.027, conversion_rate: 0.028, cpc: 5.26 },
  twitter: { reach_rate: 0.048, engagement_rate: 0.015, conversion_rate: 0.005, cpc: 3.75 },
  email: { reach_rate: 0.85, engagement_rate: 0.21, conversion_rate: 0.18, cpc: 0.10 },
  seo: { reach_rate: 0.45, engagement_rate: 0.024, conversion_rate: 0.025, cpc: 0.00 },
  influencer: { reach_rate: 0.25, engagement_rate: 0.037, conversion_rate: 0.019, cpc: 4.12 },
};

// Category multipliers for different product types
const CATEGORY_MULTIPLIERS = {
  electronics: { reach: 1.1, engagement: 0.9, conversion: 1.2 },
  fashion: { reach: 1.2, engagement: 1.4, conversion: 0.8 },
  health: { reach: 0.9, engagement: 1.1, conversion: 1.1 },
  home: { reach: 0.8, engagement: 0.8, conversion: 1.0 },
  sports: { reach: 1.0, engagement: 1.2, conversion: 0.9 },
  software: { reach: 0.7, engagement: 0.6, conversion: 1.5 },
  education: { reach: 0.6, engagement: 0.7, conversion: 1.3 },
} as const;

// Demographic multipliers
const getDemographicMultiplier = (campaign: Campaign) => {
  let multiplier = 1.0;
  
  // Age-based multipliers
  const avgAge = (campaign.targeting.ageRange.min + campaign.targeting.ageRange.max) / 2;
  if (avgAge < 25) multiplier *= 1.2; // Younger audiences more engaged
  else if (avgAge > 50) multiplier *= 0.8; // Older audiences less active online
  
  // Income-based multipliers
  switch (campaign.targeting.income) {
    case 'high': multiplier *= 1.3; break;
    case 'medium': multiplier *= 1.1; break;
    case 'low': multiplier *= 0.8; break;
  }
  
  // Interest targeting boost
  if (campaign.targeting.interests.length > 0) {
    multiplier *= 1 + (campaign.targeting.interests.length * 0.1);
  }
  
  return multiplier;
};

export function runCampaignSimulation(campaign: Campaign): SimulationResults {
  const totalBudget = campaign.budget.total;
  const duration = campaign.budget.duration;
  const dailyBudget = totalBudget / duration;
  
  // Distribute budget across preferred channels or all available channels
  const activeChannels = campaign.channels.preferred.length > 0 
    ? campaign.channels.preferred 
    : Object.keys(CHANNEL_METRICS).filter(c => !campaign.channels.avoided.includes(c as MarketingChannel)) as MarketingChannel[];
  
  const budgetPerChannel = totalBudget / activeChannels.length;
  
  // Get category and demographic multipliers
  const categoryMultiplier = CATEGORY_MULTIPLIERS[campaign.product.category as keyof typeof CATEGORY_MULTIPLIERS] || 
    { reach: 1.0, engagement: 1.0, conversion: 1.0 };
  const demoMultiplier = getDemographicMultiplier(campaign);
  
  let totalReach = 0;
  let totalEngagement = 0;
  let totalConversions = 0;
  let totalSpend = 0;
  
  const channelBreakdown: SimulationResults['channelBreakdown'] = {} as any;
  
  // Calculate metrics for each active channel
  activeChannels.forEach(channel => {
    const metrics = CHANNEL_METRICS[channel];
    const channelBudget = budgetPerChannel;
    
    // Calculate base metrics
    const baseReach = (channelBudget / metrics.cpc) * metrics.reach_rate;
    const reach = Math.round(baseReach * categoryMultiplier.reach * demoMultiplier);
    
    const engagement = Math.round(reach * metrics.engagement_rate * categoryMultiplier.engagement);
    const conversions = Math.round(reach * metrics.conversion_rate * categoryMultiplier.conversion);
    
    const revenue = conversions * campaign.product.price;
    const roi = ((revenue - channelBudget) / channelBudget) * 100;
    
    channelBreakdown[channel] = {
      spend: channelBudget,
      reach,
      conversions,
      roi,
    };
    
    totalReach += reach;
    totalEngagement += engagement;
    totalConversions += conversions;
    totalSpend += channelBudget;
  });
  
  // Calculate overall metrics
  const totalRevenue = totalConversions * campaign.product.price;
  const overallROI = ((totalRevenue - totalSpend) / totalSpend) * 100;
  const costPerConversion = totalSpend / totalConversions;
  
  // Generate timeline data (simplified daily progression)
  const timeline = [];
  for (let day = 1; day <= Math.min(duration, 30); day++) {
    const progressFactor = Math.min(1, day / 7); // Ramp up over first week
    const dailyReach = Math.round((totalReach / duration) * progressFactor);
    const dailyConversions = Math.round((totalConversions / duration) * progressFactor);
    
    timeline.push({
      day,
      reach: dailyReach,
      conversions: dailyConversions,
      spend: dailyBudget,
    });
  }
  
  return {
    campaignId: campaign.id,
    metrics: {
      estimatedReach: totalReach,
      estimatedEngagement: totalEngagement,
      estimatedConversions: totalConversions,
      estimatedROI: Math.round(overallROI * 100) / 100,
      costPerConversion: Math.round(costPerConversion * 100) / 100,
    },
    channelBreakdown,
    timeline,
  };
}

export function generateOptimizationSuggestions(
  campaign: Campaign, 
  results: SimulationResults
) {
  const suggestions = [];
  
  // Find best and worst performing channels
  const channelPerformance = Object.entries(results.channelBreakdown)
    .map(([channel, metrics]) => ({
      channel: channel as MarketingChannel,
      roi: metrics.roi,
      conversions: metrics.conversions,
      spend: metrics.spend,
    }))
    .sort((a, b) => b.roi - a.roi);
  
  if (channelPerformance.length >= 2) {
    const bestChannel = channelPerformance[0];
    const worstChannel = channelPerformance[channelPerformance.length - 1];
    
    if (bestChannel.roi > worstChannel.roi + 50) {
      suggestions.push({
        type: 'budget_reallocation' as const,
        title: 'Reallocate Budget to High-Performing Channels',
        description: `Move 30% of budget from ${worstChannel.channel} to ${bestChannel.channel} for better ROI`,
        impact: {
          roi_increase: 15,
          reach_increase: 8,
          conversion_increase: 12,
        },
        changes: {
          from_channel: worstChannel.channel,
          to_channel: bestChannel.channel,
          amount: Math.round(worstChannel.spend * 0.3),
        },
      });
    }
  }
  
  // Suggest adding high-performing channels if not already included
  const availableChannels = Object.keys(CHANNEL_METRICS) as MarketingChannel[];
  const unusedChannels = availableChannels.filter(
    channel => !campaign.channels.preferred.includes(channel) &&
               !campaign.channels.avoided.includes(channel)
  );
  
  // Recommend Google Ads if not used and budget > $500
  if (unusedChannels.includes('google-ads') && campaign.budget.total > 500) {
    suggestions.push({
      type: 'channel_addition' as const,
      title: 'Add Google Ads for Better Reach',
      description: 'Google Ads typically provides high-intent traffic with good conversion rates',
      impact: {
        roi_increase: 12,
        reach_increase: 25,
        conversion_increase: 18,
      },
      changes: {
        to_channel: 'google-ads' as MarketingChannel,
        amount: Math.round(campaign.budget.total * 0.25),
      },
    });
  }
  
  // Recommend Email Marketing for high-value products
  if (unusedChannels.includes('email') && campaign.product.price > 50) {
    suggestions.push({
      type: 'channel_addition' as const,
      title: 'Add Email Marketing for Higher ROI',
      description: 'Email marketing has the highest ROI and works well for repeat purchases',
      impact: {
        roi_increase: 22,
        reach_increase: 5,
        conversion_increase: 15,
      },
      changes: {
        to_channel: 'email' as MarketingChannel,
        amount: Math.round(campaign.budget.total * 0.15),
      },
    });
  }
  
  return suggestions;
}