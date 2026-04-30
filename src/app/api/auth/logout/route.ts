import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
