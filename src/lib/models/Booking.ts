import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  userId?: Types.ObjectId;
  itineraryId: string;
  city: string;
  state: string;
  title: string;
  image: string;
  duration: string;
  budget: string;
  bestSeason: string;
  rating: number;
  travelDate: string;
  travelers: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    itineraryId: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    title: { type: String, required: true },
    image: { type: String, default: '' },
    duration: { type: String, default: '' },
    budget: { type: String, default: '' },
    bestSeason: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    travelDate: { type: String, required: true },
    travelers: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String, required: true },
    paymentMethod: { type: String, default: '' },
    status: { type: String, default: 'confirmed', enum: ['confirmed', 'cancelled', 'completed'] },
    paymentStatus: { type: String, default: 'pending', enum: ['pending', 'paid', 'link_sent'] },
  },
  { timestamps: true }
);

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
