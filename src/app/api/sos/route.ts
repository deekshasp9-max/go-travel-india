import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rideId, latitude, longitude, message } = body;

    const alert = await db.sOSAlert.create({
      data: {
        rideId: rideId || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        message: message || 'SOS Alert triggered!',
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error creating SOS alert:', error);
    return NextResponse.json({ error: 'Failed to create SOS alert' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const alerts = await db.sOSAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch SOS alerts' }, { status: 500 });
  }
}
