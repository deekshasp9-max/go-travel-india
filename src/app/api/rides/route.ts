import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rideType, pickup, destination, pickupLat, pickupLng, destLat, destLng, distance, fare, status } = body;

    const ride = await db.ride.create({
      data: {
        rideType,
        pickup,
        destination,
        pickupLat,
        pickupLng,
        destLat,
        destLng,
        distance,
        fare,
        status: status || 'completed',
      },
    });

    return NextResponse.json(ride);
  } catch (error) {
    console.error('Error creating ride:', error);
    return NextResponse.json({ error: 'Failed to create ride' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rides = await db.ride.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json({ error: 'Failed to fetch rides' }, { status: 500 });
  }
}
