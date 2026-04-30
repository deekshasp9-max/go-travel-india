import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate a fallback cubic Bezier route between two points (20 points).
 * The two control points are offset perpendicular to the straight line
 * to create a gentle curved path.
 */
function generateFallbackRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
) {
  const NUM_POINTS = 20;
  const midLat = (originLat + destLat) / 2;
  const midLng = (originLng + destLng) / 2;

  // Perpendicular offset for curvature
  const dx = destLng - originLng;
  const dy = destLat - originLat;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = dist * 0.2;

  // Normal perpendicular direction
  const nx = -dy / dist;
  const ny = dx / dist;

  const cp1Lat = midLat + ny * offset;
  const cp1Lng = midLng + nx * offset;
  const cp2Lat = midLat - ny * offset;
  const cp2Lng = midLng - nx * offset;

  const route: [number, number][] = [];

  for (let i = 0; i <= NUM_POINTS; i++) {
    const t = i / NUM_POINTS;
    const mt = 1 - t;

    // Cubic Bezier formula
    const lat =
      mt * mt * mt * originLat +
      3 * mt * mt * t * cp1Lat +
      3 * mt * t * t * cp2Lat +
      t * t * t * destLat;
    const lng =
      mt * mt * mt * originLng +
      3 * mt * mt * t * cp1Lng +
      3 * mt * t * t * cp2Lng +
      t * t * t * destLng;

    route.push([Math.round(lat * 1e6) / 1e6, Math.round(lng * 1e6) / 1e6]);
  }

  // Approximate straight-line distance using Haversine (meters)
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(destLat - originLat);
  const dLng = toRad(destLng - originLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(originLat)) *
      Math.cos(toRad(destLat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Rough duration estimate: ~30 km/h average speed
  const duration = (distance / 1000 / 30) * 3600;

  return { route, distance: Math.round(distance), duration: Math.round(duration) };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Both "origin" and "destination" query parameters are required (format: lat,lng)' },
        { status: 400 }
      );
    }

    const [originLatStr, originLngStr] = origin.split(',');
    const [destLatStr, destLngStr] = destination.split(',');

    const originLat = parseFloat(originLatStr);
    const originLng = parseFloat(originLngStr);
    const destLat = parseFloat(destLatStr);
    const destLng = parseFloat(destLngStr);

    if ([originLat, originLng, destLat, destLng].some((v) => isNaN(v))) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Use format: lat,lng' },
        { status: 400 }
      );
    }

    // OSRM uses lng,lat format
    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    const response = await fetch(osrmUrl, {
      headers: {
        'User-Agent': 'GoTravel/1.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error('OSRM API error:', response.status, response.statusText);
      const fallback = generateFallbackRoute(originLat, originLng, destLat, destLng);
      return NextResponse.json({ ...fallback, fallback: true });
    }

    const data = await response.json();

    if (
      !data.routes ||
      !Array.isArray(data.routes) ||
      data.routes.length === 0
    ) {
      console.error('OSRM returned no routes:', data.code);
      const fallback = generateFallbackRoute(originLat, originLng, destLat, destLng);
      return NextResponse.json({ ...fallback, fallback: true });
    }

    const osrmRoute = data.routes[0];
    const coordinates: [number, number][] = osrmRoute.geometry.coordinates.map(
      // OSRM returns [lng, lat], swap to [lat, lng]
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    return NextResponse.json({
      route: coordinates,
      distance: Math.round(osrmRoute.distance),
      duration: Math.round(osrmRoute.duration),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      // On timeout, try to extract coordinates and generate fallback
      const { searchParams } = new URL(request.url);
      const origin = searchParams.get('origin');
      const destination = searchParams.get('destination');

      if (origin && destination) {
        const [oLatStr, oLngStr] = origin.split(',');
        const [dLatStr, dLngStr] = destination.split(',');
        const oLat = parseFloat(oLatStr);
        const oLng = parseFloat(oLngStr);
        const dLat = parseFloat(dLatStr);
        const dLng = parseFloat(dLngStr);

        if (![oLat, oLng, dLat, dLng].some((v) => isNaN(v))) {
          const fallback = generateFallbackRoute(oLat, oLng, dLat, dLng);
          return NextResponse.json({ ...fallback, fallback: true });
        }
      }

      return NextResponse.json(
        { error: 'Routing request timed out' },
        { status: 504 }
      );
    }

    console.error('Routing error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate route' },
      { status: 500 }
    );
  }
}
