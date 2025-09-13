import { Campaign } from '@/lib/types';
import { runCampaignSimulation, generateOptimizationSuggestions } from '@/lib/simulation';
import { storage } from '@/lib/storage';
import { campaignSchema, type CampaignInput } from '@/lib/validators/campaign';
import { ValidationError, SimulationError, NotFoundError } from '@/lib/errors/api-errors';

export class CampaignService {
  static validateCampaign(data: unknown): CampaignInput {
    const validationResult = campaignSchema.safeParse(data);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      
      throw new ValidationError('Validation failed', errors);
    }

    return validationResult.data;
  }

  static validateBusinessRules(campaignData: CampaignInput): void {
    if (campaignData.targeting.ageRange.min >= campaignData.targeting.ageRange.max) {
      throw new ValidationError('Business rule validation failed', [
        { path: 'targeting.ageRange', message: 'Age range minimum must be less than maximum' }
      ]);
    }
  }

  static generateCampaignId(): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `campaign_${timestamp}_${randomPart}`;
  }

  static createCampaign(campaignData: CampaignInput): Campaign {
    return {
      id: this.generateCampaignId(),
      name: campaignData.name.trim(),
      product: {
        ...campaignData.product,
        name: campaignData.product.name.trim(),
        description: campaignData.product.description.trim(),
      },
      targeting: {
        ...campaignData.targeting,
        interests: campaignData.targeting.interests.map(i => i.trim()).filter(i => i.length > 0),
        location: campaignData.targeting.location.map(l => l.trim()).filter(l => l.length > 0),
      },
      budget: campaignData.budget as any,
      channels: campaignData.channels as any,
      creatives: (campaignData.creatives || []) as any,
      createdAt: new Date(),
    };
  }

  static async processCampaign(rawData: unknown) {
    // Parse request body
    if (!rawData) {
      throw new Error('Invalid JSON in request body');
    }

    console.log('Received campaign data:', JSON.stringify(rawData, null, 2));

    // Validate campaign data
    const campaignData = this.validateCampaign(rawData);
    
    // Additional business logic validation
    this.validateBusinessRules(campaignData);
    
    // Create campaign object
    const campaign = this.createCampaign(campaignData);
    
    // Store campaign
    storage.saveCampaign(campaign);
    
    // Run simulation with error handling
    let simulationResults, optimizationSuggestions;
    
    try {
      simulationResults = runCampaignSimulation(campaign);
      optimizationSuggestions = await generateOptimizationSuggestions(campaign, simulationResults);
    } catch (error) {
      throw new SimulationError('Failed to run campaign simulation', campaign.id);
    }
    
    // Store results
    storage.saveResults(campaign.id, campaign, simulationResults, optimizationSuggestions);
    
    return {
      success: true,
      campaignId: campaign.id,
      message: 'Campaign created and simulation completed successfully',
      stats: {
        reach: simulationResults.metrics.estimatedReach,
        roi: simulationResults.metrics.estimatedROI,
        conversions: simulationResults.metrics.estimatedConversions,
      }
    };
  }

  static getCampaign(campaignId: string) {
    const campaign = storage.getCampaign(campaignId);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }
    return { success: true, campaign };
  }

  static getAllCampaigns(limit?: string, offset?: string) {
    let campaigns = storage.getAllCampaigns();
    
    // Sort by creation date (newest first)
    campaigns = campaigns.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply pagination
    const limitNum = limit ? Math.min(Math.max(1, parseInt(limit)), 100) : 10;
    const offsetNum = offset ? Math.max(0, parseInt(offset)) : 0;
    
    const paginatedCampaigns = campaigns.slice(offsetNum, offsetNum + limitNum);
    
    return { 
      success: true, 
      campaigns: paginatedCampaigns,
      pagination: {
        total: campaigns.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < campaigns.length
      }
    };
  }

  static deleteCampaign(campaignId: string) {
    const deleted = storage.deleteCampaign(campaignId);
    
    if (!deleted) {
      throw new NotFoundError('Campaign not found');
    }
    
    return {
      success: true,
      message: 'Campaign deleted successfully'
    };
  }
}