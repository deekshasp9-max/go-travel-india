import { NextRequest, NextResponse } from 'next/server';
import { auth, signInWithEmailAndPassword } from '@/lib/firebase-auth';
import { queryCollection } from '@/lib/firebase-db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Get user data from Firestore
    const users = await queryCollection('users', 'email', email);
    const userData = users.length > 0 ? users[0] : null;

    return NextResponse.json({
      user: {
        id: userData?.id || user.uid,
        uid: user.uid,
        name: userData?.name || '',
        email: user.email,
        phone: userData?.phone || '',
        role: userData?.role || 'user',
      },
      token,
    });
  } catch (error: any) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { error: error.message || 'Invalid email or password' },
      { status: 401 }
    );
  }
}
