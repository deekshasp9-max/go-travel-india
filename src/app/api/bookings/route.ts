import { NextRequest, NextResponse } from 'next/server';
import { addDocument, getCollection, updateDocument } from '@/lib/firebase-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId, itineraryId, city, state, title, image, duration, budget,
      bestSeason, rating, travelDate, travelers, totalPrice,
      guestName, guestEmail, guestPhone, paymentMethod,
    } = body;

    if (!title || !city || !guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { error: 'Title, city, guest name, email, and phone are required' },
        { status: 400 }
      );
    }

    const booking = await addDocument('bookings', {
      userId: userId || '',
      itineraryId: itineraryId || '',
      city,
      state: state || '',
      title,
      image: image || '',
      duration: duration || '',
      budget: budget || '',
      bestSeason: bestSeason || '',
      rating: parseFloat(rating) || 0,
      travelDate: travelDate || '',
      travelers: parseInt(travelers) || 1,
      totalPrice: parseFloat(totalPrice) || 0,
      guestName,
      guestEmail,
      guestPhone,
      paymentMethod: paymentMethod || '',
      status: 'confirmed',
      paymentStatus: 'pending',
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await getCollection('bookings');
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await updateDocument('bookings', id, { status: 'cancelled' });

    return NextResponse.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
