import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rides = await db.ride.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const alerts = await db.sOSAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const itineraries = await db.savedItinerary.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      rides,
      sosAlerts: alerts,
      savedItineraries: itineraries,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
