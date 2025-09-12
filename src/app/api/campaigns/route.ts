import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/services/api/campaign-service';
import { handleError } from '@/lib/errors/api-errors';

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json().catch(() => {
      throw new Error('Invalid JSON in request body');
    });

    const result = await CampaignService.processCampaign(rawData);
    return NextResponse.json(result);
    
  } catch (error) {
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    if (campaignId) {
      const result = CampaignService.getCampaign(campaignId);
      return NextResponse.json(result);
    } else {
      const result = CampaignService.getAllCampaigns(limit || undefined, offset || undefined);
      return NextResponse.json(result);
    }
    
  } catch (error) {
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');
    
    if (!campaignId) {
      const errorResponse = handleError(new Error('Campaign ID is required'));
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    const result = CampaignService.deleteCampaign(campaignId);
    return NextResponse.json(result);
    
  } catch (error) {
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}