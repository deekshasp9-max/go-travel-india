'use client';

import { useGoTravelStore } from '@/store/go-travel-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  MapPin, Clock, Star, Calendar, IndianRupee, ChevronRight,
  ArrowLeft, Sun, Bookmark, Mountain, Temple, Waves, Coffee, Camera
} from 'lucide-react';
import { itineraries, type Itinerary } from '@/data/mock-data';

const categoryIcons: Record<string, string> = {
  Temple: '🛕', Fort: '🏰', Beach: '🏖️', Nature: '🌿', Adventure: '⛰️',
  Museum: '🏛️', Market: '🏪', Monastery: '🛕', Waterfall: '💧', Heritage: '🏛️',
  Palace: '🏰', Mountain: '🏔️', Village: '🏘️', Hot: '♨️', Art: '🎨',
  Observatory: '🔭', Cultural: '🎭', Food: '🍽️', Monument: '🏛️', Garden: '🌺',
  Church: '⛪', Heritage: '🏛️', Viewpoint: '📸', Nightlife: '🌙', Restaurant: '🍽️',
  Wildlife: '🦁', Plantation: '🌿', Culture: '🎭', Experience: '✨', Entertainment: '🎰',
  Island: '🏝️', Lake: '🏞️', Ghat: '🪔', Ceremony: '🙏', Handicraft: '🧵',
  Bridge: '🌉', Trekking: '🥾', Stepwell: '📐', 'Mountain Pass': '🏔️',
};

export function TourismPage() {
  const { selectedItinerary, setSelectedItinerary } = useGoTravelStore();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? itineraries : itineraries.filter(i => i.days.length <= parseInt(filter));

  if (selectedItinerary) {
    const itinerary = itineraries.find(i => i.id === selectedItinerary);
    if (!itinerary) return null;
    return <ItineraryDetail itinerary={itinerary} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore India</h1>
        <p className="text-gray-500 mt-1">Curated multi-day itineraries for every kind of traveler</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', '2', '3', '4', '5'].map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
          >
            {f === 'all' ? 'All Trips' : `${f} Days`}
          </Button>
        ))}
      </div>

      {/* Itinerary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.map((itin, i) => (
          <motion.div
            key={itin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group"
              onClick={() => setSelectedItinerary(itin.id)}
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-emerald-100 to-teal-50 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform duration-500">
                      {itin.city === 'Manali' ? '🏔️' : itin.city === 'Jaipur' ? '🏰' : itin.city === 'Goa' ? '🏖️' : itin.city === 'Varanasi' ? '🛕' : itin.city === 'Kerala' ? '🌴' : ' raft' ? '🚣' : '✨'}
                    </div>
                  </div>
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
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg">{itin.city}</h3>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {itin.state}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-gray-900 text-base leading-tight">{itin.title}</h3>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {itin.days.length} Days</span>
                    <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> {itin.bestSeason}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> {itin.budget}</span>
                  </div>
                  {/* Places Preview */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {itin.days[0].places.slice(0, 3).map((p, j) => (
                      <Badge key={j} variant="secondary" className="text-[10px] font-medium">
                        {categoryIcons[p.type] || '📍'} {p.name}
                      </Badge>
                    ))}
                    {itin.days[0].places.length > 3 && (
                      <Badge variant="secondary" className="text-[10px]">+{itin.days[0].places.length - 3} more</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{itin.days.reduce((a, d) => a + d.places.length, 0)} places to visit</span>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs px-3">
                      View Itinerary <ChevronRight className="w-3 h-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ItineraryDetail({ itinerary }: { itinerary: Itinerary }) {
  const { setSelectedItinerary } = useGoTravelStore();
  const [activeDay, setActiveDay] = useState(1);

  const currentDay = itinerary.days.find(d => d.day === activeDay);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      <Button variant="ghost" onClick={() => setSelectedItinerary(null)} className="mb-4 text-gray-600">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Itineraries
      </Button>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-10 text-white overflow-hidden mb-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <Badge className="bg-white/20 text-white backdrop-blur-sm mb-3">{itinerary.state}</Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold">{itinerary.title}</h1>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {itinerary.duration}</span>
            <span className="flex items-center gap-1.5"><Sun className="w-4 h-4" /> {itinerary.bestSeason}</span>
            <span className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4" /> {itinerary.budget}</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-yellow-300 text-yellow-300" /> {itinerary.rating}</span>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {itinerary.days.map(day => (
          <Button
            key={day.day}
            variant={activeDay === day.day ? 'default' : 'outline'}
            onClick={() => setActiveDay(day.day)}
            className={`whitespace-nowrap rounded-xl ${activeDay === day.day ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
          >
            Day {day.day}
          </Button>
        ))}
      </div>

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
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Day {currentDay.day}: {currentDay.title}</h2>
                <p className="text-gray-500 mt-1">{currentDay.description}</p>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                {currentDay.places.map((place, i) => (
                  <div key={i} className="relative flex gap-4 pb-6">
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
                            <h3 className="font-bold text-gray-900">{place.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px]">{place.type}</Badge>
                              <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {place.time}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{place.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
