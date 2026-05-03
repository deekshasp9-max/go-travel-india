import { NextRequest, NextResponse } from 'next/server';
import { addDocument, getCollection } from '@/lib/firebase-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rideId, latitude, longitude, message } = body;

    const alert = await addDocument('sosAlerts', {
      rideId: rideId || '',
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      message: message || 'SOS Alert triggered!',
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error creating SOS alert:', error);
    return NextResponse.json({ error: 'Failed to create SOS alert' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const alerts = await getCollection('sosAlerts');
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch SOS alerts' }, { status: 500 });
  }
}
