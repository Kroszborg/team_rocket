import { NextRequest, NextResponse } from 'next/server';
import { isBackendAvailable } from '@/lib/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Try backend first
    try {
      const response = await fetch(`${BACKEND_URL}/api/campaigns/${campaignId}/results`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.warn('Backend unavailable, generating results:', error);
    }

    // Generate results using ML service or simulation
    const { runCampaignSimulation, generateOptimizationSuggestions } = await import('@/lib/simulation');

    // Server-side doesn't have access to localStorage, so skip this check
    // Campaign data will be provided by the client-side hooks

    // Fallback: Generate mock results for any campaign ID
    const mockCampaign = {
      id: campaignId,
      name: "Campaign Results",
      product: { name: "Product", price: 99, targetMargin: 30 },
      budget: { total: 5000, duration: 30 },
      targeting: { ageRange: { min: 25, max: 45 }, gender: 'all' },
      channels: { preferred: ["google-ads", "facebook", "instagram"] }
    };

    const simulation = runCampaignSimulation(mockCampaign);
    const optimization = await generateOptimizationSuggestions(mockCampaign);

    return NextResponse.json({
      success: true,
      results: simulation,
      optimization: optimization,
      campaign: mockCampaign
    });

  } catch (error) {
    console.error('Error fetching campaign results:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Check if backend is available
    const backendAvailable = await isBackendAvailable();

    if (backendAvailable) {
      try {
        // Try to regenerate results via backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/${campaignId}/results`, {
          method: 'POST'
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch (error) {
        console.warn('Backend regeneration failed, falling back to demo mode:', error);
      }
    }

    // Fallback to demo mode regeneration
    const demoMode = (await import('@/lib/demo-mode')).default;
    const existingResults = demoMode.getCampaignResults(campaignId);

    if (existingResults) {
      // Regenerate with some variation
      const newSimulation = demoMode.generateSimulationResults(existingResults.campaign);
      const newOptimization = demoMode.generateOptimizationSuggestions(existingResults.campaign);

      // Store updated results
      demoMode.storeCampaignResults(campaignId, {
        campaign: existingResults.campaign,
        simulation: newSimulation,
        optimization: newOptimization
      });

      return NextResponse.json({
        success: true,
        results: newSimulation,
        optimization: newOptimization
      });
    }

    return NextResponse.json(
      { success: false, error: 'Campaign not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error regenerating campaign results:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}