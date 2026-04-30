import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rideType, pickup, destination, pickupLat, pickupLng, destLat, destLng, distance, fare, status, paymentMethod } = body;

    const ride = await db.ride.create({
      data: {
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
      },
    });

    return NextResponse.json(ride);
  } catch (error) {
    console.error('Error creating ride:', error);
    return NextResponse.json({ error: 'Failed to create ride' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, paymentMethod, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ride ID required' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const ride = await db.ride.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(ride);
  } catch (error) {
    console.error('Error updating ride:', error);
    return NextResponse.json({ error: 'Failed to update ride' }, { status: 500 });
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
