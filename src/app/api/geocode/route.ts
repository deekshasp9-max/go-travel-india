import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    // Use Nominatim for geocoding with India bias
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=8&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'GoTravel-App/1.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Nominatim responded with status ${response.status}`);
    }

    const data = await response.json();

    const results = data.map((item: Record<string, unknown>) => ({
      displayName: item.display_name as string,
      lat: parseFloat(item.lat as string),
      lng: parseFloat(item.lon as string),
      address: {
        city: (item.address as Record<string, string>)?.city ||
              (item.address as Record<string, string>)?.town ||
              (item.address as Record<string, string>)?.village ||
              '',
        state: (item.address as Record<string, string>)?.state || '',
        country: (item.address as Record<string, string>)?.country || '',
        postcode: (item.address as Record<string, string>)?.postcode || '',
        road: (item.address as Record<string, string>)?.road || '',
      },
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}
