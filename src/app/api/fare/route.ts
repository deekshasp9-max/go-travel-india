import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const distance = parseFloat(searchParams.get('distance') || '0');
  const type = searchParams.get('type') || 'auto';

  const rates: Record<string, { base: number; perKm: number }> = {
    bike: { base: 20, perKm: 7 },
    auto: { base: 30, perKm: 12 },
    car: { base: 50, perKm: 15 },
    carPremium: { base: 80, perKm: 20 },
  };

  const rate = rates[type] || rates.auto;
  const fare = Math.round(rate.base + distance * rate.perKm);

  return NextResponse.json({
    distance,
    type,
    baseFare: rate.base,
    perKmRate: rate.perKm,
    totalFare: fare,
  });
}
