'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Calendar, Users, MapPin, CreditCard, X, ArrowRight,
  Package, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useGoTravelStore } from '@/store/go-travel-store';

// ── Types ───────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  itineraryId: string;
  title: string;
  city: string;
  state: string;
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
  status: 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: string;
  createdAt: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: {
    label: 'Confirmed',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
};

function getStatusBadge(status: string) {
  const config = statusConfig[status] || statusConfig.confirmed;
  return (
    <Badge className={`text-[10px] font-semibold ${config.className}`}>
      {config.label}
    </Badge>
  );
}

const paymentMethodConfig: Record<string, { label: string; className: string }> = {
  UPI: {
    label: 'UPI',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  Card: {
    label: 'Card',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  'Net Banking': {
    label: 'Net Banking',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  Wallet: {
    label: 'Wallet',
    className: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  Link: {
    label: 'Payment Link',
    className: 'bg-teal-100 text-teal-700 border-teal-200',
  },
};

function getPaymentBadge(method: string) {
  const config = paymentMethodConfig[method];
  if (config) {
    return (
      <Badge className={`text-[10px] font-medium ${config.className}`}>
        <CreditCard className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-[10px] font-medium">
      <CreditCard className="w-3 h-3 mr-1" />
      {method}
    </Badge>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── Loading Skeleton ────────────────────────────────────────────────────────

function BookingSkeleton() {
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="w-full sm:w-48 h-40 sm:h-auto flex-shrink-0" />
        <div className="flex-1 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Booking Card ────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
}) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    await onCancel(booking.id);
    setCancelling(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.35 }}
    >
      <Card
        className={`border-0 shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md ${
          booking.status === 'cancelled' ? 'opacity-70' : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Destination Image / Illustration */}
          <div className="w-full sm:w-48 h-40 sm:h-auto flex-shrink-0 relative overflow-hidden">
            {booking.image ? (
              <img
                src={booking.image}
                alt={booking.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-5xl">
                  {booking.city === 'Manali'
                    ? '🏔️'
                    : booking.city === 'Jaipur'
                      ? '🏰'
                      : booking.city === 'Goa'
                        ? '🏖️'
                        : booking.city === 'Varanasi'
                          ? '🛕'
                          : booking.city === 'Kerala'
                            ? '🌴'
                            : '✈️'}
                </span>
              </div>
            )}
            {/* Status overlay */}
            <div className="absolute top-3 left-3">{getStatusBadge(booking.status)}</div>
          </div>

          {/* Card Content */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Title & Payment Badge */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">
                  {booking.title}
                </h3>
                {getPaymentBadge(booking.paymentMethod)}
              </div>

              {/* City / State */}
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>
                  {booking.city}{booking.state ? `, ${booking.state}` : ''}
                </span>
              </div>

              {/* Details Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(booking.travelDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  {booking.travelers} {booking.travelers === 1 ? 'Traveler' : 'Travelers'}
                </span>
                {booking.duration && (
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    {booking.duration}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Price + Cancel */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
              <p className="text-lg font-extrabold text-gray-900">
                ₹{booking.totalPrice.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-gray-400 ml-1">total</span>
              </p>

              {booking.status === 'confirmed' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-xs rounded-lg"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Cancelling…
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 mr-1" />
                      Cancel
                    </>
                  )}
                </Button>
              ) : booking.status === 'cancelled' ? (
                <Badge variant="secondary" className="text-[10px] text-gray-500">
                  Refund processing
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  const { setCurrentPage } = useGoTravelStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Illustration */}
      <div className="relative w-48 h-48 mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl block mb-2">🌍</span>
            <span className="text-4xl">🎫</span>
          </div>
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-300 rounded-full animate-bounce" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-teal-300 rounded-full animate-bounce [animation-delay:0.3s]" />
        <div className="absolute top-8 -left-3 w-2 h-2 bg-emerald-200 rounded-full animate-bounce [animation-delay:0.6s]" />
      </div>

      <h3 className="text-xl font-bold text-gray-900">No bookings yet</h3>
      <p className="text-sm text-gray-500 mt-1.5 max-w-xs text-center leading-relaxed">
        Your upcoming travel adventures and past trips will appear here.
        Start exploring to book your first trip!
      </p>

      <Button
        onClick={() => setCurrentPage('tourism')}
        className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
      >
        Explore Destinations
        <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function BookingsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to cancel booking');
      // Auto-refresh after successful cancel
      await fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Ticket className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Bookings
          </h1>
          <p className="text-gray-500 text-sm">
            {user?.name ? `${user.name}'s trips & reservations` : 'Your trips & reservations'}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <BookingSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <X className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Oops!</h3>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <Button
            variant="outline"
            onClick={fetchBookings}
            className="mt-4 rounded-xl"
          >
            Try Again
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary Bar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
            </span>
            <div className="flex items-center gap-1.5">
              {bookings.filter((b) => b.status === 'confirmed').length > 0 && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                  {bookings.filter((b) => b.status === 'confirmed').length} Confirmed
                </Badge>
              )}
              {bookings.filter((b) => b.status === 'completed').length > 0 && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">
                  {bookings.filter((b) => b.status === 'completed').length} Completed
                </Badge>
              )}
              {bookings.filter((b) => b.status === 'cancelled').length > 0 && (
                <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                  {bookings.filter((b) => b.status === 'cancelled').length} Cancelled
                </Badge>
              )}
            </div>
          </div>

          {/* Booking Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancel}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
