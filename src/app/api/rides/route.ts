import { NextRequest, NextResponse } from 'next/server';
import { Ride } from '@/lib/models';
import { ensureDB } from '@/lib/ensure-db';

export async function POST(request: NextRequest) {
  try {
    await ensureDB();
    const body = await request.json();
    const { rideType, pickup, destination, pickupLat, pickupLng, destLat, destLng, distance, fare, status, paymentMethod } = body;

    const ride = await Ride.create({
      rideType,
      pickup,
      destination,
      pickupLat: parseFloat(pickupLat),
      pickupLng: parseFloat(pickupLng),
      destLat: parseFloat(destLat),
      destLng: parseFloat(destLng),
      distance: parseFloat(distance),
      fare: parseFloat(fare),
      status: status || 'completed',
      paymentMethod: paymentMethod || '',
    });

    return NextResponse.json(ride);
  } catch (error) {
    console.error('Error creating ride:', error);
    return NextResponse.json({ error: 'Failed to create ride' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureDB();
    const rides = await Ride.find().sort({ createdAt: -1 }).limit(50).lean();
    const formatted = rides.map((r: any) => ({
      ...r,
      id: r._id.toString(),
      _id: undefined,
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json({ error: 'Failed to fetch rides' }, { status: 500 });
  }
}
