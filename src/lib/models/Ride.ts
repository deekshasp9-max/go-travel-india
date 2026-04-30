import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRide extends Document {
  userId?: Types.ObjectId;
  rideType: string;
  pickup: string;
  destination: string;
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  distance: number;
  fare: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
}

const RideSchema = new Schema<IRide>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    rideType: { type: String, required: true },
    pickup: { type: String, required: true },
    destination: { type: String, required: true },
    pickupLat: { type: Number, required: true },
    pickupLng: { type: Number, required: true },
    destLat: { type: Number, required: true },
    destLng: { type: Number, required: true },
    distance: { type: Number, required: true },
    fare: { type: Number, required: true },
    status: { type: String, default: 'completed', enum: ['searching', 'ongoing', 'completed', 'cancelled'] },
    paymentMethod: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Ride = mongoose.models.Ride || mongoose.model<IRide>('Ride', RideSchema);
