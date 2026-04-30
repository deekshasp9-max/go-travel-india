import { NextResponse } from 'next/server';

interface OSRMRoute {
  geometry: { coordinates: [number, number][] };
  legs: Array<{
    distance: { value: number };
    duration: { value: number };
  }>;
}

function generateBezierRoute(
  pickupLat: number,
  pickupLng: number,
  destLat: number,
  destLng: number
): [number, number][] {
  const midLat = (pickupLat + destLat) / 2;
  const midLng = (pickupLng + destLng) / 2;

  // Create a curved path between pickup and destination
  const dist = Math.sqrt(
    Math.pow(destLat - pickupLat, 2) + Math.pow(destLng - pickupLng, 2)
  );

  // Perpendicular offset for the curve
  const angle = Math.atan2(destLng - pickupLng, destLat - pickupLat);
  const perpAngle = angle + Math.PI / 2;
  const curvature = dist * 0.15;

  const controlLat = midLat + Math.cos(perpAngle) * curvature;
  const controlLng = midLng + Math.sin(perpAngle) * curvature;

  const steps = 30;
  const coordinates: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Cubic Bezier: one control point duplicated for quadratic-like curve
    const lat =
      Math.pow(1 - t, 2) * pickupLat +
      2 * (1 - t) * t * controlLat +
      Math.pow(t, 2) * destLat;
    const lng =
      Math.pow(1 - t, 2) * pickupLng +
      2 * (1 - t) * t * controlLng +
      Math.pow(t, 2) * destLng;

    coordinates.push([lng, lat]);
  }

  return coordinates;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pickupLat = parseFloat(searchParams.get('pickupLat') || '0');
  const pickupLng = parseFloat(searchParams.get('pickupLng') || '0');
  const destLat = parseFloat(searchParams.get('destLat') || '0');
  const destLng = parseFloat(searchParams.get('destLng') || '0');

  if (!pickupLat || !pickupLng || !destLat || !destLng) {
    return NextResponse.json(
      { error: 'Pickup and destination coordinates are required' },
      { status: 400 }
    );
  }

  try {
    // Try OSRM routing first
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const response = await fetch(osrmUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route: OSRMRoute = data.routes[0];
        const distanceKm = Math.round(route.legs[0].distance.value / 10) / 100;
        const durationMin = Math.round(route.legs[0].duration.value / 60);

        return NextResponse.json({
          geometry: route.geometry.coordinates,
          distance: distanceKm,
          duration: durationMin,
          source: 'osrm',
        });
      }
    }
  } catch (error) {
    console.log('OSRM routing failed, using Bezier fallback:', error);
  }

  // Fallback: Cubic Bezier route generation
  const coordinates = generateBezierRoute(pickupLat, pickupLng, destLat, destLng);

  // Haversine distance calculation
  const R = 6371;
  const dLat = ((destLat - pickupLat) * Math.PI) / 180;
  const dLng = ((destLng - pickupLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pickupLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c * 10) / 10;
  const durationMin = Math.round((distanceKm / 25) * 60); // ~25 km/h avg speed

  return NextResponse.json({
    geometry: coordinates,
    distance: distanceKm,
    duration: durationMin,
    source: 'bezier',
  });
}
