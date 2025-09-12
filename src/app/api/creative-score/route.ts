import { NextRequest, NextResponse } from 'next/server';
import { Creative } from '@/lib/types';
import { CreativeService } from '@/services/api/creative-service';
import { handleError } from '@/lib/errors/api-errors';

export async function POST(request: NextRequest) {
  try {
    const { creative }: { creative: Creative } = await request.json();
    const score = await CreativeService.scoreCreative(creative);
    
    return NextResponse.json({
      success: true,
      score,
    });
    
  } catch (error) {
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel')!;
    const productName = searchParams.get('productName')!;
    const category = searchParams.get('category')!;
    
    const suggestions = await CreativeService.generateSuggestions(channel, productName, category);
    
    return NextResponse.json({
      success: true,
      suggestions,
    });
    
  } catch (error) {
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}