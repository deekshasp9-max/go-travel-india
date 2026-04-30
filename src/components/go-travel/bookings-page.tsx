'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Calendar, MapPin, IndianRupee, Clock, Users, Star,
  CreditCard, ChevronRight, Trash2, AlertTriangle, CheckCircle,
  XCircle, Loader2, Image as ImageIcon, Eye, ArrowRight
} from 'lucide-react';
import { useGoTravelStore } from '@/store/go-travel-store';
import { toast } from '@/hooks/use-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookingRecord {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getStatusConfig(status: string): { label: string; color: string; icon: React.ReactNode } {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> };
    case 'completed':
      return { label: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <CheckCircle className="w-3 h-3" /> };
    case 'cancelled':
      return { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="w-3 h-3" /> };
    case 'pending':
      return { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" /> };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <Clock className="w-3 h-3" /> };
  }
}

function getPaymentBadge(method: string): { label: string; color: string } {
  if (!method) return { label: 'Pending', color: 'bg-gray-100 text-gray-500' };
  if (method.startsWith('UPI')) return { label: 'UPI', color: 'bg-purple-100 text-purple-700' };
  if (method.startsWith('Card')) return { label: 'Card', color: 'bg-blue-100 text-blue-700' };
  if (method.startsWith('Net Banking')) return { label: 'Net Banking', color: 'bg-indigo-100 text-indigo-700' };
  if (method.startsWith('Wallet')) return { label: 'Wallet', color: 'bg-green-100 text-green-700' };
  if (method.startsWith('Pay Later')) return { label: 'Pay Later', color: 'bg-amber-100 text-amber-700' };
  if (method.startsWith('Email')) return { label: 'Email Link', color: 'bg-teal-100 text-teal-700' };
  return { label: method.split(':')[0] || 'Paid', color: 'bg-gray-100 text-gray-600' };
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function BookingsPage() {
  const { setCurrentPage } = useGoTravelStore();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = useCallback(async (booking: BookingRecord) => {
    setCancellingId(booking.id);
    try {
      const res = await fetch(`/api/bookings?id=${booking.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({
          title: 'Booking Cancelled',
          description: `Your trip to ${booking.city} has been cancelled.`,
        });
        setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
      } else {
        toast({
          title: 'Cancel Failed',
          description: 'Could not cancel booking. Try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Cancel Failed',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancellingId(null);
    }
  }, []);

  // Filter bookings
  const filtered = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'confirmed') return b.status.toLowerCase() === 'confirmed';
    if (activeTab === 'completed') return b.status.toLowerCase() === 'completed';
    if (activeTab === 'cancelled') return b.status.toLowerCase() === 'cancelled';
    return true;
  });

  const confirmedCount = bookings.filter((b) => b.status.toLowerCase() === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status.toLowerCase() === 'completed').length;
  const cancelledCount = bookings.filter((b) => b.status.toLowerCase() === 'cancelled').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Ticket className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 text-sm">View and manage your trip bookings</p>
        </div>
        {bookings.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage('tourism')}
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            Book New Trip <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex h-auto p-1 bg-gray-100 rounded-xl">
          <TabsTrigger value="all" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            All ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Confirmed ({confirmedCount})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Completed ({completedCount})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Cancelled ({cancelledCount})
          </TabsTrigger>
        </TabsList>

        {/* All tabs share the same content */}
        {['all', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-400 mt-3">Loading bookings...</p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                onAction={() => setCurrentPage('tourism')}
              />
            ) : (
              <div className="space-y-4">
                {filtered.map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <BookingCard
                      booking={booking}
                      onCancel={handleCancel}
                      cancelling={cancellingId === booking.id}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Booking Card Sub-component
// ---------------------------------------------------------------------------

function BookingCard({
  booking,
  onCancel,
  cancelling,
}: {
  booking: BookingRecord;
  onCancel: (booking: BookingRecord) => void;
  cancelling: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const statusConfig = getStatusConfig(booking.status);
  const paymentBadge = getPaymentBadge(booking.paymentMethod);

  return (
    <Card className="hover:shadow-lg transition-all border-gray-100 overflow-hidden">
      <CardContent className="p-0">
        {/* Top row with image & summary */}
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="sm:w-40 h-40 sm:h-auto bg-gradient-to-br from-emerald-100 to-teal-50 flex-shrink-0 relative overflow-hidden">
            {booking.image ? (
              <img
                src={booking.image}
                alt={booking.city}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-50 items-center justify-center"
              style={{ display: booking.image ? 'none' : 'flex' }}
            >
              <MapPin className="w-10 h-10 text-emerald-300" />
            </div>
            {/* Status badge on image */}
            <div className="absolute top-2 left-2">
              <Badge className={`${statusConfig.color} text-[10px] font-semibold border`}>
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* Summary */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base truncate">
                  {booking.title}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {booking.city}, {booking.state}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-extrabold text-emerald-700">{formatINR(booking.totalPrice)}</p>
                <p className="text-[10px] text-gray-400">total price</p>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(booking.travelDate)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {booking.travelers} {booking.travelers === 1 ? 'Traveler' : 'Travelers'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {booking.duration}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {booking.rating}
              </span>
            </div>

            {/* Payment method badge */}
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="text-[10px]">
                <CreditCard className="w-3 h-3 mr-0.5" />
                {paymentBadge.label}
              </Badge>
              <span className="text-[10px] text-gray-400">
                Booked on {formatDate(booking.createdAt)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-gray-500 hover:text-emerald-600"
              >
                <Eye className="w-3 h-3 mr-1" />
                {showDetails ? 'Hide' : 'View'} Details
              </Button>

              <div className="flex-1" />

              {booking.status.toLowerCase() === 'confirmed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(booking)}
                  disabled={cancelling}
                  className="text-xs text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  {cancelling ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3 mr-1" />
                  )}
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Guest Info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Guest Details</h4>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                      <p className="text-sm"><span className="text-gray-400">Name:</span> <span className="font-medium text-gray-800">{booking.guestName}</span></p>
                      <p className="text-sm"><span className="text-gray-400">Email:</span> <span className="font-medium text-gray-800">{booking.guestEmail}</span></p>
                      <p className="text-sm"><span className="text-gray-400">Phone:</span> <span className="font-medium text-gray-800">{booking.guestPhone}</span></p>
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trip Details</h4>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                      <p className="text-sm"><span className="text-gray-400">City:</span> <span className="font-medium text-gray-800">{booking.city}, {booking.state}</span></p>
                      <p className="text-sm"><span className="text-gray-400">Duration:</span> <span className="font-medium text-gray-800">{booking.duration}</span></p>
                      <p className="text-sm"><span className="text-gray-400">Best Season:</span> <span className="font-medium text-gray-800">{booking.bestSeason}</span></p>
                      <p className="text-sm"><span className="text-gray-400">Budget:</span> <span className="font-medium text-gray-800">{booking.budget}</span></p>
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="mt-4 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Price Breakdown</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base price x {booking.travelers} traveler(s)</span>
                      <span className="font-medium">{formatINR(booking.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taxes & fees</span>
                      <span className="font-medium text-emerald-600">Included</span>
                    </div>
                    <div className="border-t border-emerald-200 pt-1.5 flex justify-between">
                      <span className="font-bold text-gray-900">Total Paid</span>
                      <span className="text-lg font-extrabold text-emerald-700">{formatINR(booking.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Booking ID */}
                <div className="mt-3 text-center">
                  <p className="text-[10px] text-gray-400">
                    Booking ID: <span className="font-mono">{booking.id}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Ticket className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-400">No bookings yet</h3>
      <p className="text-sm text-gray-400 mt-1 mb-4">
        Explore amazing destinations and book your first trip!
      </p>
      <Button
        variant="outline"
        onClick={onAction}
        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
      >
        Explore Destinations <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
