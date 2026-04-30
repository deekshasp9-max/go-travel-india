'use client';

import { useGoTravelStore } from '@/store/go-travel-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  MapPin, Clock, Star, Calendar, IndianRupee, ChevronRight,
  ArrowLeft, Sun, Users, CreditCard, Loader2, CheckCircle2,
  AlertCircle, Eye, ShoppingCart
} from 'lucide-react';
import { itineraries, type Itinerary } from '@/data/mock-data';
import { toast } from '@/hooks/use-toast';
import PaymentModal from '@/components/go-travel/payment-modal';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const categoryIcons: Record<string, string> = {
  Temple: '🛕', Fort: '🏰', Beach: '🏖️', Nature: '🌿', Adventure: '⛰️',
  Museum: '🏛️', Market: '🏪', Monastery: '🛕', Waterfall: '💧', Heritage: '🏛️',
  Palace: '🏰', Mountain: '🏔️', Village: '🏘️', Hot: '♨️', Art: '🎨',
  Observatory: '🔭', Cultural: '🎭', Food: '🍽️', Monument: '🏛️', Garden: '🌺',
  Church: '⛪', Heritage: '🏛️', Viewpoint: '📸', Nightlife: '🌙', Restaurant: '🍽️',
  Wildlife: '🦁', Plantation: '🌿', Culture: '🎭', Experience: '✨', Entertainment: '🎰',
  Island: '🏝️', Lake: '🏞️', Ghat: '🪔', Ceremony: '🙏', Handicraft: '🧵',
  Bridge: '🌉', Trekking: '🥾', Stepwell: '📐', 'Mountain Pass': '🏔️',
  'Hot Springs': '♨️', 'Art Gallery': '🎨',
};

const cityImageMap: Record<string, string> = {
  Manali: '/destinations/manali.png',
  Jaipur: '/destinations/jaipur.png',
  Goa: '/destinations/goa.png',
  Varanasi: '/destinations/varanasi.png',
  Kerala: '/destinations/kerala.png',
  Rishikesh: '/destinations/rishikesh.png',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCityImage(city: string): string {
  return cityImageMap[city] || '';
}

function parseBasePrice(budget: string): number {
  const match = budget.match(/₹([\d,]+)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  return 0;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMinDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Standalone validation function (used by BookingDialog)
function validateForm(form: BookingForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.travelDate) errors.travelDate = 'Please select a travel date';
  if (!form.travelers || form.travelers < 1) errors.travelers = 'Select at least 1 traveler';
  if (!form.guestName.trim()) errors.guestName = 'Please enter your name';
  if (!form.guestEmail.trim()) errors.guestEmail = 'Please enter your email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail))
    errors.guestEmail = 'Please enter a valid email';
  if (!form.guestPhone.trim()) errors.guestPhone = 'Please enter your phone number';
  else if (!/^[6-9]\d{9}$/.test(form.guestPhone.replace(/\s/g, '')))
    errors.guestPhone = 'Please enter a valid 10-digit phone number';
  return errors;
}

// ---------------------------------------------------------------------------
// Booking form state
// ---------------------------------------------------------------------------

interface BookingForm {
  travelDate: string;
  travelers: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

interface FormErrors {
  travelDate?: string;
  travelers?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TourismPage() {
  const { selectedItinerary, setSelectedItinerary, setCurrentPage } = useGoTravelStore();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<string>('all');

  // Booking state
  const [showBooking, setShowBooking] = useState(false);
  const [bookingItinerary, setBookingItinerary] = useState<Itinerary | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingBookingRef = useRef<{
    form: BookingForm;
    totalPrice: number;
    itinerary: Itinerary;
  } | null>(null);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? itineraries
        : itineraries.filter((i) => i.days.length === parseInt(filter)),
    [filter],
  );

  // Open booking dialog
  const openBooking = useCallback((itinerary: Itinerary) => {
    setBookingItinerary(itinerary);
    setShowBooking(true);
  }, []);

  // Proceed to payment
  const handleProceedToPayment = useCallback(
    (form: BookingForm, totalPrice: number, itinerary: Itinerary) => {
      // Store the booking details for after payment
      pendingBookingRef.current = { form, totalPrice, itinerary };
      // Close booking dialog BEFORE opening payment modal to avoid z-index conflicts
      setShowBooking(false);
      // Small delay to allow dialog to close
      setTimeout(() => {
        setShowPayment(true);
      }, 300);
    },
    [],
  );

  // Payment success handler
  const handlePaymentSuccess = useCallback(
    async (paymentMethod: string) => {
      setShowPayment(false);
      const pending = pendingBookingRef.current;
      if (!pending) return;

      const { form, totalPrice, itinerary } = pending;
      setIsSubmitting(true);

      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itineraryId: itinerary.id,
            city: itinerary.city,
            state: itinerary.state,
            title: itinerary.title,
            image: getCityImage(itinerary.city),
            duration: itinerary.duration,
            budget: itinerary.budget,
            bestSeason: itinerary.bestSeason,
            rating: itinerary.rating,
            travelDate: form.travelDate,
            travelers: form.travelers,
            totalPrice,
            guestName: form.guestName,
            guestEmail: form.guestEmail,
            guestPhone: form.guestPhone,
            paymentMethod,
          }),
        });

        if (res.ok) {
          toast({
            title: 'Booking Confirmed! 🎉',
            description: `Your trip to ${itinerary.city} has been booked successfully. Check your bookings page for details.`,
          });
          setSelectedItinerary(null);
          setCurrentPage('bookings');
        } else {
          toast({
            title: 'Booking Failed',
            description: 'Something went wrong. Please try again.',
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: 'Booking Failed',
          description: 'Network error. Please check your connection and try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
        pendingBookingRef.current = null;
      }
    },
    [setSelectedItinerary, setCurrentPage],
  );

  // Payment modal close
  const handlePaymentClose = useCallback(() => {
    setShowPayment(false);
    pendingBookingRef.current = null;
  }, []);

  // Render detail view
  if (selectedItinerary) {
    const itinerary = itineraries.find((i) => i.id === selectedItinerary);
    if (!itinerary) return null;
    return (
      <>
        <ItineraryDetail
          itinerary={itinerary}
          onBack={() => setSelectedItinerary(null)}
          onBook={() => openBooking(itinerary)}
        />
        <BookingDialog
          isOpen={showBooking}
          itinerary={bookingItinerary}
          user={user}
          onClose={() => setShowBooking(false)}
          onProceed={handleProceedToPayment}
        />
        <PaymentModal
          amount={pendingBookingRef.current?.totalPrice ?? 0}
          isOpen={showPayment}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
        />
      </>
    );
  }

  // Render list view
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Explore India
          </h1>
          <p className="text-gray-500 mt-1">
            Curated multi-day itineraries for every kind of traveler
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {['all', '2', '3', '4', '5'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : ''
              }
            >
              {f === 'all' ? 'All Trips' : `${f} Days`}
            </Button>
          ))}
        </motion.div>

        {/* Itinerary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((itin, i) => (
              <motion.div
                key={itin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                layout
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group bg-white">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div
                      className="relative h-48 sm:h-56 overflow-hidden cursor-pointer"
                      onClick={() => setSelectedItinerary(itin.id)}
                    >
                      {getCityImage(itin.city) ? (
                        <Image
                          src={getCityImage(itin.city)}
                          alt={itin.city}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          fallback={
                            <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center">
                              <span className="text-6xl">✨</span>
                            </div>
                          }
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center">
                          <span className="text-6xl">✨</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm">
                          <Calendar className="w-3 h-3 mr-1" />
                          {itin.duration}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-emerald-600 text-white shadow-sm">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          {itin.rating}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h3 className="text-white font-bold text-lg">
                          {itin.city}
                        </h3>
                        <p className="text-white/80 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {itin.state}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                      <h3 className="font-bold text-gray-900 text-base leading-tight">
                        {itin.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {itin.days.length} Days
                        </span>
                        <span className="flex items-center gap-1">
                          <Sun className="w-3 h-3" /> {itin.bestSeason}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" /> {itin.budget}
                        </span>
                      </div>

                      {/* Places Preview */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {itin.days[0].places.slice(0, 3).map((p, j) => (
                          <Badge
                            key={j}
                            variant="secondary"
                            className="text-[10px] font-medium"
                          >
                            {categoryIcons[p.type] || '📍'} {p.name}
                          </Badge>
                        ))}
                        {itin.days[0].places.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px]"
                          >
                            +{itin.days[0].places.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {itin.days.reduce((a, d) => a + d.places.length, 0)}{' '}
                          places to visit
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedItinerary(itin.id)}
                            className="text-xs px-3 rounded-lg"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              openBooking(itin);
                            }}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Booking Dialog (list view) */}
      <BookingDialog
        isOpen={showBooking}
        itinerary={bookingItinerary}
        user={user}
        onClose={() => setShowBooking(false)}
        onProceed={handleProceedToPayment}
      />

      {/* Payment Modal */}
      <PaymentModal
        amount={pendingBookingRef.current?.totalPrice ?? 0}
        isOpen={showPayment}
        onClose={handlePaymentClose}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Itinerary Detail Sub-component
// ---------------------------------------------------------------------------

function ItineraryDetail({
  itinerary,
  onBack,
  onBook,
}: {
  itinerary: Itinerary;
  onBack: () => void;
  onBook: () => void;
}) {
  const [activeDay, setActiveDay] = useState(1);
  const currentDay = itinerary.days.find((d) => d.day === activeDay);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Itineraries
      </Button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden mb-6"
      >
        {getCityImage(itinerary.city) ? (
          <div className="relative h-56 sm:h-72">
            <Image
              src={getCityImage(itinerary.city)}
              alt={itinerary.city}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="relative h-56 sm:h-72 bg-gradient-to-br from-emerald-500 to-teal-600">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 text-white">
          <Badge className="bg-white/20 text-white backdrop-blur-sm mb-2">
            {itinerary.state}
          </Badge>
          <h1 className="text-xl sm:text-3xl font-extrabold leading-tight">
            {itinerary.title}
          </h1>
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
              <Calendar className="w-3.5 h-3.5" /> {itinerary.duration}
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
              <Sun className="w-3.5 h-3.5" /> {itinerary.bestSeason}
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
              <IndianRupee className="w-3.5 h-3.5" /> {itinerary.budget}
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
              <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />{' '}
              {itinerary.rating}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Day Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
      >
        {itinerary.days.map((day) => (
          <Button
            key={day.day}
            variant={activeDay === day.day ? 'default' : 'outline'}
            onClick={() => setActiveDay(day.day)}
            className={`whitespace-nowrap rounded-xl ${
              activeDay === day.day
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : ''
            }`}
          >
            Day {day.day}
          </Button>
        ))}
      </motion.div>

      {/* Day Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentDay && (
            <>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                  Day {currentDay.day}: {currentDay.title}
                </h2>
                <p className="text-gray-500 mt-1">{currentDay.description}</p>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                {currentDay.places.map((place, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="relative flex gap-4 pb-6"
                  >
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-lg z-10 flex-shrink-0">
                        {categoryIcons[place.type] || '📍'}
                      </div>
                      {i < currentDay.places.length - 1 && (
                        <div className="w-0.5 flex-1 bg-emerald-200 mt-2" />
                      )}
                    </div>
                    {/* Content */}
                    <Card className="flex-1 border-0 shadow-sm bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {place.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {place.type}
                              </Badge>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {place.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                          {place.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Book This Trip Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-8"
      >
        <Separator className="mb-6" />
        <Card className="border-emerald-100 bg-emerald-50/50">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Ready to explore {itinerary.city}?
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Starting from{' '}
                  <span className="font-semibold text-emerald-700">
                    {formatINR(parseBasePrice(itinerary.budget))}
                  </span>{' '}
                  per person · {itinerary.duration}
                </p>
              </div>
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 w-full sm:w-auto"
                onClick={onBook}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Book This Trip
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Booking Dialog Sub-component
// ---------------------------------------------------------------------------

function BookingDialog({
  isOpen,
  itinerary,
  user,
  onClose,
  onProceed,
}: {
  isOpen: boolean;
  itinerary: Itinerary | null;
  user: { name: string; email: string; phone?: string | null } | null;
  onClose: () => void;
  onProceed: (
    form: BookingForm,
    totalPrice: number,
    itinerary: Itinerary,
  ) => void;
}) {
  const [form, setForm] = useState<BookingForm>({
    travelDate: '',
    travelers: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Pre-fill from user when dialog opens
  const handleOpen = useCallback(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        guestName: user.name || prev.guestName,
        guestEmail: user.email || prev.guestEmail,
        guestPhone: user.phone || prev.guestPhone,
      }));
    }
    setErrors({});
  }, [user]);

  const basePrice = itinerary ? parseBasePrice(itinerary.budget) : 0;
  const totalPrice = basePrice * (form.travelers || 1);

  const updateField = useCallback(
    <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!itinerary) return;
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onProceed(form, totalPrice, itinerary);
  }, [form, itinerary, totalPrice, onProceed, validateForm]);

  if (!itinerary) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0"
        onOpenAutoFocus={handleOpen}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Book Your Trip
            </DialogTitle>
            <DialogDescription className="text-emerald-100">
              Complete your booking for {itinerary.city}, {itinerary.state}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Itinerary summary */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative">
              {getCityImage(itinerary.city) ? (
                <Image
                  src={getCityImage(itinerary.city)}
                  alt={itinerary.city}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {itinerary.title}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {itinerary.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3" /> {itinerary.bestSeason}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" /> {itinerary.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">
          {/* Travel Date */}
          <div className="space-y-2">
            <Label htmlFor="travelDate" className="text-sm font-medium">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-emerald-600" />
              Travel Date
            </Label>
            <Input
              id="travelDate"
              type="date"
              min={getMinDate()}
              value={form.travelDate}
              onChange={(e) => updateField('travelDate', e.target.value)}
              className={
                errors.travelDate ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''
              }
            />
            {errors.travelDate && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.travelDate}
              </p>
            )}
          </div>

          {/* Number of Travelers */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              <Users className="w-3.5 h-3.5 inline mr-1.5 text-emerald-600" />
              Number of Travelers
            </Label>
            <Select
              value={String(form.travelers)}
              onValueChange={(v) => updateField('travelers', parseInt(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select travelers" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? 'Traveler' : 'Travelers'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.travelers && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.travelers}
              </p>
            )}
          </div>

          <Separator />

          {/* Guest Name */}
          <div className="space-y-2">
            <Label htmlFor="guestName" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="guestName"
              type="text"
              placeholder="Enter your full name"
              value={form.guestName}
              onChange={(e) => updateField('guestName', e.target.value)}
              className={
                errors.guestName ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''
              }
            />
            {errors.guestName && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.guestName}
              </p>
            )}
          </div>

          {/* Guest Email */}
          <div className="space-y-2">
            <Label htmlFor="guestEmail" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="guestEmail"
              type="email"
              placeholder="you@example.com"
              value={form.guestEmail}
              onChange={(e) => updateField('guestEmail', e.target.value)}
              className={
                errors.guestEmail ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''
              }
            />
            {errors.guestEmail && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.guestEmail}
              </p>
            )}
          </div>

          {/* Guest Phone */}
          <div className="space-y-2">
            <Label htmlFor="guestPhone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="guestPhone"
              type="tel"
              placeholder="10-digit mobile number"
              value={form.guestPhone}
              onChange={(e) =>
                updateField(
                  'guestPhone',
                  e.target.value.replace(/\D/g, '').slice(0, 10),
                )
              }
              className={
                errors.guestPhone ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''
              }
            />
            {errors.guestPhone && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.guestPhone}
              </p>
            )}
          </div>
        </div>

        {/* Price Breakdown & Submit */}
        <div className="px-6 pb-6">
          <div className="rounded-xl bg-gray-50 border p-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Base price × {form.travelers} {form.travelers === 1 ? 'traveler' : 'travelers'}
              </span>
              <span className="font-medium text-gray-700">
                {formatINR(totalPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxes & fees</span>
              <span className="font-medium text-emerald-600">Included</span>
            </div>
            <Separator />
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-xl font-bold text-emerald-700">
                {formatINR(totalPrice)}
              </span>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Payment
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
