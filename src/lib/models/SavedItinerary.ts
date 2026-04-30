import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISavedItinerary extends Document {
  userId?: Types.ObjectId;
  city: string;
  title: string;
  days: number;
  createdAt: Date;
}

const SavedItinerarySchema = new Schema<ISavedItinerary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    city: { type: String, required: true },
    title: { type: String, required: true },
    days: { type: Number, required: true },
  },
  { timestamps: true }
);

export const SavedItinerary = mongoose.models.SavedItinerary || mongoose.model<ISavedItinerary>('SavedItinerary', SavedItinerarySchema);
