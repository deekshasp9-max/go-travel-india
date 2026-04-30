import mongoose from 'mongoose';

const ATLAS_URI = process.env.MONGODB_URI || '';
const LOCAL_URI = 'mongodb://127.0.0.1:27018/go-travel';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch {
      cached.promise = null;
    }
  }

  // Try local MongoDB first (fast, always available in dev), then Atlas
  const uris = [LOCAL_URI];
  if (ATLAS_URI && ATLAS_URI.includes('mongodb+srv')) {
    uris.push(ATLAS_URI);
  }

  for (const uri of uris) {
    const label = uri.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB';
    try {
      cached.promise = mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: uri.includes('mongodb+srv') ? 5000 : 3000,
        connectTimeoutMS: 3000,
      });
      cached.conn = await cached.promise;
      console.log(`[DB] ✅ Connected to ${label}`);
      return cached.conn;
    } catch (e: any) {
      console.warn(`[DB] ⚠️ ${label} failed: ${e.message}`);
      cached.promise = null;
    }
  }

  throw new Error('Could not connect to any MongoDB instance');
}

export default connectDB;
