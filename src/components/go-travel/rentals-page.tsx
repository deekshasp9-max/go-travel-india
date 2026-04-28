'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Car, Bike, Star, MapPin, Fuel, Settings2, Users, Search } from 'lucide-react';
import { rentalVehicles } from '@/data/mock-data';

export function RentalsPage() {
  const [location, setLocation] = useState('all');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price');

  const locations = [...new Set(rentalVehicles.map(v => v.location))];

  const filtered = useMemo(() => {
    let result = rentalVehicles.filter(v => {
      if (location !== 'all' && v.location !== location) return false;
      if (type !== 'all' && v.type !== type) return false;
      return true;
    });
    result.sort((a, b) => {
      if (sortBy === 'price') return a.pricePerDay - b.pricePerDay;
      return b.rating - a.rating;
    });
    return result;
  }, [location, type, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Car className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Rental Vehicles</h1>
          <p className="text-gray-500 text-sm">Cars & bikes available at popular tourist spots</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1">
          {['all', 'car', 'bike', 'scooter'].map(t => (
            <Button
              key={t}
              variant={type === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType(t)}
              className={`text-xs h-9 capitalize ${type === t ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
            >
              {t}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-gray-500">Sort:</span>
          <Button variant={sortBy === 'price' ? 'default' : 'ghost'} size="sm" onClick={() => setSortBy('price')}
            className={`text-xs h-9 ${sortBy === 'price' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
            Price
          </Button>
          <Button variant={sortBy === 'rating' ? 'default' : 'ghost'} size="sm" onClick={() => setSortBy('rating')}
            className={`text-xs h-9 ${sortBy === 'rating' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
            Rating
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} vehicles available</p>

      {/* Vehicle Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((vehicle, i) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card className={`hover:shadow-lg transition-all border-0 overflow-hidden ${!vehicle.available ? 'opacity-60' : ''}`}>
              <CardContent className="p-0">
                {/* Image */}
                <div className={`relative h-40 flex items-center justify-center ${
                  vehicle.type === 'car' ? 'bg-gradient-to-br from-amber-50 to-orange-50' :
                  vehicle.type === 'bike' ? 'bg-gradient-to-br from-red-50 to-pink-50' :
                  'bg-gradient-to-br from-blue-50 to-cyan-50'
                }`}>
                  <span className="text-6xl">{vehicle.image}</span>
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700 shadow-sm text-[10px]">
                      <MapPin className="w-3 h-3 mr-0.5" /> {vehicle.location}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    {vehicle.available ? (
                      <Badge className="bg-emerald-600 text-white text-[10px]">Available</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-600 text-[10px]">Unavailable</Badge>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{vehicle.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{vehicle.rating}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{vehicle.type}</Badge>
                  </div>

                  {/* Specs */}
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {vehicle.fuelType}</span>
                    <span className="flex items-center gap-1"><Settings2 className="w-3 h-3" /> {vehicle.transmission}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {vehicle.seats}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Per Day</p>
                      <p className="text-xl font-extrabold text-gray-900">₹{vehicle.pricePerDay.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">₹{vehicle.pricePerHour}/hr</p>
                    </div>
                    <Button
                      disabled={!vehicle.available}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm px-4 disabled:opacity-50"
                    >
                      {vehicle.available ? 'Book Now' : 'Sold Out'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Car className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No vehicles found</h3>
          <p className="text-sm text-gray-400 mt-1">Try different filters</p>
        </div>
      )}
    </div>
  );
}
