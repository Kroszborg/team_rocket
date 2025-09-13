import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json().catch(() => {
      throw new Error('Invalid JSON in request body');
    });

    console.log('Forwarding campaign creation to backend:', rawData);

    // Forward request to backend API
    const response = await fetch(`${BACKEND_URL}/api/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rawData),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in campaign API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process campaign',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlSearchParams = new URLSearchParams();

    // Forward all search params to backend
    searchParams.forEach((value, key) => {
      urlSearchParams.append(key, value);
    });

    const response = await fetch(`${BACKEND_URL}/api/campaigns?${urlSearchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in campaign GET API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaigns',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/campaigns?id=${campaignId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in campaign DELETE API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete campaign',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}