import { NextRequest, NextResponse } from 'next/server';
import { addDocument, getCollection, updateDocument } from '@/lib/firebase-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rideType, pickup, destination, pickupLat, pickupLng, destLat, destLng, distance, fare, status, paymentMethod } = body;

    const ride = await addDocument('rides', {
      rideType,
      pickup,
      destination,
      pickupLat: parseFloat(pickupLat) || 0,
      pickupLng: parseFloat(pickupLng) || 0,
      destLat: parseFloat(destLat) || 0,
      destLng: parseFloat(destLng) || 0,
      distance: parseFloat(distance) || 0,
      fare: parseFloat(fare) || 0,
      status: status || 'completed',
      paymentMethod: paymentMethod || '',
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
    const { id, paymentMethod, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ride ID required' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (status) updateData.status = status;

    const ride = await updateDocument('rides', id, updateData);
    return NextResponse.json(ride);
  } catch (error) {
    console.error('Error updating ride:', error);
    return NextResponse.json({ error: 'Failed to update ride' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rides = await getCollection('rides');
    return NextResponse.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json({ error: 'Failed to fetch rides' }, { status: 500 });
  }
}
