import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      itineraryId, city, state, title, image, duration, budget,
      bestSeason, rating, travelDate, travelers, totalPrice,
      guestName, guestEmail, guestPhone, paymentMethod,
    } = body;

    if (!itineraryId || !city || !title || !travelDate || !travelers || !totalPrice || !guestName || !guestEmail || !guestPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const booking = await db.booking.create({
      data: {
        itineraryId,
        city,
        state: state || '',
        title,
        image: image || '',
        duration: duration || '',
        budget: budget || '',
        bestSeason: bestSeason || '',
        rating: rating || 0,
        travelDate,
        travelers: parseInt(travelers),
        totalPrice: parseFloat(totalPrice),
        guestName,
        guestEmail,
        guestPhone,
        paymentMethod: paymentMethod || 'Online',
        status: 'confirmed',
        paymentStatus: paymentMethod?.includes('Link') ? 'link_sent' : 'paid',
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const booking = await db.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
