import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;

    const response = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'GoTravel-App/1.0' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Nominatim responded with status ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    // Build a short, readable name
    const parts: string[] = [];
    if (addr.road) parts.push(addr.road);
    if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
    if (!parts.length && (addr.city || addr.town || addr.village)) parts.push(addr.city || addr.town || addr.village);
    if (addr.city || addr.town || addr.village) {
      const city = addr.city || addr.town || addr.village;
      if (!parts.includes(city)) parts.push(city);
    }

    return NextResponse.json({
      displayName: data.display_name || '',
      shortName: parts.join(', ') || data.display_name || `${lat}, ${lng}`,
      address: {
        road: addr.road || '',
        suburb: addr.suburb || '',
        neighbourhood: addr.neighbourhood || '',
        city: addr.city || addr.town || addr.village || '',
        state: addr.state || '',
        postcode: addr.postcode || '',
        country: addr.country || '',
      },
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return NextResponse.json({ error: 'Failed to reverse geocode' }, { status: 500 });
  }
}
