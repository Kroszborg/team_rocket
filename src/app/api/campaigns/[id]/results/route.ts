import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }
    
    // Find results for this campaign
    const campaignResults = storage.getResults(id);
    
    if (!campaignResults) {
      // Check if campaign exists but has no results
      const campaign = storage.getCampaign(id);
      if (!campaign) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Results not available',
          message: 'Campaign exists but simulation results are not ready. Please try again.'
        },
        { status: 202 } // Accepted but processing
      );
    }
    
    return NextResponse.json({
      success: true,
      results: campaignResults.simulation,
      optimization: campaignResults.optimization,
      campaign: campaignResults.campaign,
      metadata: {
        createdAt: campaignResults.createdAt,
        campaignId: campaignResults.campaignId,
      }
    });
    
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch results',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Add method to regenerate results
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }
    
    const campaign = storage.getCampaign(id);
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    // Re-run simulation (useful for testing or if algorithms are updated)
    const { runCampaignSimulation, generateOptimizationSuggestions } = await import('@/lib/simulation');
    
    const simulationResults = runCampaignSimulation(campaign);
    const optimizationSuggestions = generateOptimizationSuggestions(campaign, simulationResults);
    
    // Store updated results
    storage.saveResults(id, campaign, simulationResults, optimizationSuggestions);
    
    return NextResponse.json({
      success: true,
      results: simulationResults,
      optimization: optimizationSuggestions,
      message: 'Results regenerated successfully'
    });
    
  } catch (error) {
    console.error('Error regenerating results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate results' },
      { status: 500 }
    );
  }
}