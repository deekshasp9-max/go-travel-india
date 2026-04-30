import connectDB from '@/lib/mongodb';

export async function ensureDB() {
  await connectDB();
}
