import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-auth';
import { queryCollection } from '@/lib/firebase-db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);

    // Get user data from Firestore
    const users = await queryCollection('users', 'uid', decodedToken.uid);
    const userData = users.length > 0 ? users[0] : null;

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        uid: decodedToken.uid,
        name: userData.name || '',
        email: userData.email || decodedToken.email,
        phone: userData.phone || '',
        role: userData.role || 'user',
      }
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
