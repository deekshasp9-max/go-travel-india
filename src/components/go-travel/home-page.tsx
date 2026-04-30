'use client';

import { useGoTravelStore } from '@/store/go-travel-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  MapPin, Plane, Train, Bus, Bike, Car, Shield, Star,
  ArrowRight, ChevronRight, Sparkles, TrendingUp
} from 'lucide-react';

const destinations = [
  { name: 'Manali', state: 'Himachal Pradesh', image: '/destinations/manali.png', emoji: '🏔️', tag: 'Adventure' },
  { name: 'Goa', state: 'Goa', image: '/destinations/goa.png', emoji: '🏖️', tag: 'Beaches' },
  { name: 'Jaipur', state: 'Rajasthan', image: '/destinations/jaipur.png', emoji: '🏰', tag: 'Heritage' },
  { name: 'Kerala', state: 'Kerala', image: '/destinations/kerala.png', emoji: '🌴', tag: 'Backwaters' },
  { name: 'Varanasi', state: 'Uttar Pradesh', image: '/destinations/varanasi.png', emoji: '🛕', tag: 'Spiritual' },
  { name: 'Rishikesh', state: 'Uttarakhand', image: '/destinations/rishikesh.png', emoji: '🚣', tag: 'Adventure' },
  { name: 'Agra', state: 'Uttar Pradesh', image: '/destinations/agra.png', emoji: '🕌', tag: 'Heritage' },
  { name: 'Udaipur', state: 'Rajasthan', image: '/destinations/udaipur.png', emoji: '🏰', tag: 'Lakes' },
  { name: 'Ladakh', state: 'Ladakh', image: '/destinations/ladakh.png', emoji: '🏔️', tag: 'Adventure' },
  { name: 'Darjeeling', state: 'West Bengal', image: '/destinations/darjeeling.png', emoji: '🍵', tag: 'Hills' },
  { name: 'Amritsar', state: 'Punjab', image: '/destinations/amritsar.png', emoji: '🛕', tag: 'Spiritual' },
  { name: 'Munnar', state: 'Kerala', image: '/destinations/munnar.png', emoji: '🍵', tag: 'Tea Gardens' },
];

const features = [
  { icon: <Plane className="w-6 h-6" />, title: 'Flight Prices', desc: 'Compare 50+ airlines', color: 'from-orange-100 to-amber-50', iconColor: 'text-orange-600' },
  { icon: <Train className="w-6 h-6" />, title: 'Train Tickets', desc: 'IRCTC partner prices', color: 'from-blue-100 to-sky-50', iconColor: 'text-blue-600' },
  { icon: <Bus className="w-6 h-6" />, title: 'Bus Booking', desc: 'RedBus & more', color: 'from-green-100 to-emerald-50', iconColor: 'text-green-600' },
  { icon: <Bike className="w-6 h-6" />, title: 'Local Rides', desc: 'Bike, Auto & Car', color: 'from-purple-100 to-fuchsia-50', iconColor: 'text-purple-600' },
];

export function HomePage() {
  const { setCurrentPage } = useGoTravelStore();

  const navigate = (page: 'tourism' | 'flights' | 'trains' | 'buses' | 'rides' | 'rentals') => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-20 lg:pb-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" /> India&apos;s #1 Travel Platform
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Explore India Like{' '}
              <span className="bg-gradient-to-r from-yellow-200 to-amber-200 bg-clip-text text-transparent">
                Never Before
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-emerald-100 max-w-xl leading-relaxed">
              Discover breathtaking destinations, compare travel prices, and book local rides — all in one place.
            </p>

            {/* Quick Search Bar */}
            <div className="mt-8 bg-white rounded-2xl p-2 shadow-2xl shadow-emerald-900/20 max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    className="w-full bg-transparent text-gray-800 text-sm outline-none placeholder:text-gray-400"
                    readOnly
                    onClick={() => navigate('tourism')}
                  />
                </div>
                <Button
                  onClick={() => navigate('tourism')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 font-semibold shadow-lg shadow-emerald-200 transition-all hover:shadow-xl"
                >
                  Explore Now <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-300" />
                <span><strong>4.8/5</strong> User Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-300" />
                <span><strong>50L+</strong> Happy Travelers</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-300" />
                <span><strong>100%</strong> Safe Rides</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br ${feature.color} group`}
                onClick={() => {
                  if (i === 0) navigate('flights');
                  else if (i === 1) navigate('trains');
                  else if (i === 2) navigate('buses');
                  else navigate('rides');
                }}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className={`${feature.iconColor} mb-3`}>{feature.icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{feature.desc}</p>
                  <ChevronRight className="w-4 h-4 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Popular Destinations</h2>
            <p className="text-gray-500 mt-1">Curated itineraries for your next trip</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('tourism')} className="text-emerald-600 font-semibold">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {destinations.map((dest, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden group"
                onClick={() => navigate('tourism')}
              >
                <CardContent className="p-0">
                  <div className="relative h-28 sm:h-32 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent p-2">
                      <span className="text-white text-xs font-semibold">{dest.name}</span>
                    </div>
                    {/* Fallback for broken images */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 items-center justify-center text-4xl sm:text-5xl" style={{ display: 'none' }}>
                      {dest.emoji}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-gray-900">{dest.name}</h3>
                    <p className="text-xs text-gray-500">{dest.state}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {dest.tag}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Ride Booking CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 overflow-hidden">
          <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold">Need a Quick Ride?</h2>
              <p className="text-emerald-100 mt-2 text-sm sm:text-base">
                Book Bike, Auto, or Car rides with real-time GPS tracking. Women&apos;s safety feature included.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { icon: '🏍️', label: 'Bike' },
                  { icon: '🛺', label: 'Auto' },
                  { icon: '🚗', label: 'Car' },
                  { icon: '🛡️', label: 'Safe Rides' },
                ].map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium">
                    {item.icon} {item.label}
                  </span>
                ))}
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => navigate('rides')}
              className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl px-8 py-6 font-bold text-lg shadow-xl transition-all hover:scale-105"
            >
              Book a Ride <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
