import { NextRequest, NextResponse } from 'next/server';
import { auth, createUserWithEmailAndPassword } from '@/lib/firebase-auth';
import { addDocument, queryCollection } from '@/lib/firebase-db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists in Firestore
    const existingUsers = await queryCollection('users', 'email', email);
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user data in Firestore
    const userData = await addDocument('users', {
      uid: user.uid,
      name,
      email,
      phone: phone || '',
      role: 'user',
    });

    // Get token for session
    const token = await user.getIdToken();

    return NextResponse.json({
      user: {
        id: userData.id,
        uid: user.uid,
        name,
        email,
        phone: phone || '',
        role: 'user',
      },
      token,
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
