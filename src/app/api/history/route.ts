import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/firebase-db';

export async function GET() {
  try {
    const rides = await getCollection('rides');
    const sosAlerts = await getCollection('sosAlerts');

    return NextResponse.json({
      rides,
      sosAlerts,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
