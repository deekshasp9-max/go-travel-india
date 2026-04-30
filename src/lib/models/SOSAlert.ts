import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISOSAlert extends Document {
  rideId?: Types.ObjectId;
  latitude: number;
  longitude: number;
  message: string;
  createdAt: Date;
}

const SOSAlertSchema = new Schema<ISOSAlert>(
  {
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', default: null },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    message: { type: String, default: 'SOS Alert triggered!' },
  },
  { timestamps: true }
);

export const SOSAlert = mongoose.models.SOSAlert || mongoose.model<ISOSAlert>('SOSAlert', SOSAlertSchema);
