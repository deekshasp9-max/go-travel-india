import { NextResponse } from 'next/server';
import { Ride, SOSAlert, SavedItinerary } from '@/lib/models';
import { ensureDB } from '@/lib/ensure-db';

export async function GET() {
  try {
    await ensureDB();
    const rides = await Ride.find().sort({ createdAt: -1 }).limit(50).lean();
    const alerts = await SOSAlert.find().sort({ createdAt: -1 }).limit(50).lean();
    const itineraries = await SavedItinerary.find().sort({ createdAt: -1 }).limit(50).lean();

    const format = (items: any[]) => items.map((i: any) => ({ ...i, id: i._id.toString(), _id: undefined }));

    return NextResponse.json({
      rides: format(rides),
      sosAlerts: format(alerts),
      savedItineraries: format(itineraries),
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
