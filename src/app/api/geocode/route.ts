import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const encodedQuery = encodeURIComponent(q.trim());
    const nominatimUrl =
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&countrycodes=in&limit=5`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'GoTravel/1.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Geocoding service unavailable' },
        { status: 502 }
      );
    }

    const data: Array<{
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
      type: string;
      importance: number;
    }> = await response.json();

    const results = data.map((item) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
    }));

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Geocoding request timed out' },
        { status: 504 }
      );
    }
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch geocoding results' },
      { status: 500 }
    );
  }
}
