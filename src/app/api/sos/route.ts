import { NextRequest, NextResponse } from 'next/server';
import { SOSAlert } from '@/lib/models';
import { ensureDB } from '@/lib/ensure-db';

export async function POST(request: NextRequest) {
  try {
    await ensureDB();
    const body = await request.json();
    const { rideId, latitude, longitude, message } = body;

    const alert = await SOSAlert.create({
      rideId: rideId || null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
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
    await ensureDB();
    const alerts = await SOSAlert.find().sort({ createdAt: -1 }).limit(50).lean();
    const formatted = alerts.map((a: any) => ({ ...a, id: a._id.toString(), _id: undefined }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch SOS alerts' }, { status: 500 });
  }
}
