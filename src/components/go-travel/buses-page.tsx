'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bus, ArrowRight, Star, ExternalLink, Wifi, Battery, Shield, Wind, Droplets } from 'lucide-react';
import { buses } from '@/data/mock-data';
import { CitySearchInput } from '@/components/go-travel/city-search';

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3 h-3" />,
  Charging: <Battery className="w-3 h-3" />,
  Blanket: <Droplets className="w-3 h-3" />,
  Water: <Droplets className="w-3 h-3" />,
  CCTV: <Shield className="w-3 h-3" />,
  AC: <Wind className="w-3 h-3" />,
};

export function BusesPage() {
  const [from, setFrom] = useState('Delhi');
  const [to, setTo] = useState('Manali');
  const [sortBy, setSortBy] = useState<'price' | 'departure' | 'rating'>('price');

  const filtered = useMemo(() => {
    let result = buses.filter(b => {
      if (from && !b.from.toLowerCase().includes(from.toLowerCase())) return false;
      if (to && !b.to.toLowerCase().includes(to.toLowerCase())) return false;
      return true;
    });
    result.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'departure') return a.departure.localeCompare(b.departure);
      return b.rating - a.rating;
    });
    return result;
  }, [from, to, sortBy]);

  const cheapest = filtered.length > 0 ? Math.min(...filtered.map(b => b.price)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <Bus className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bus Search</h1>
          <p className="text-gray-500 text-sm">RedBus & 100+ operators</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-lg mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <CitySearchInput
                  value={from}
                  onChange={setFrom}
                  label="From"
                  placeholder="Search departure city..."
                />
              </div>
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 w-full">
                <CitySearchInput
                  value={to}
                  onChange={setTo}
                  label="To"
                  placeholder="Search destination city..."
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="text-xs font-semibold text-green-100 mb-1 block">Date</label>
                <input type="date" className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {filtered.length} buses found
          {cheapest > 0 && <span className="ml-2 text-green-600 font-semibold">from ₹{cheapest}</span>}
        </p>
        <div className="flex items-center gap-1">
          {[
            { key: 'price' as const, label: 'Price' },
            { key: 'rating' as const, label: 'Rating' },
            { key: 'departure' as const, label: 'Time' },
          ].map(s => (
            <Button key={s.key} variant={sortBy === s.key ? 'default' : 'ghost'} size="sm" onClick={() => setSortBy(s.key)}
              className={`text-xs h-7 ${sortBy === s.key ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}>
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Bus Cards */}
      <div className="space-y-3">
        {filtered.map((bus, i) => (
          <div
            key={bus.id}
            className="animate-fade-in-up"
            style={{ animationDuration: '0.3s', animationDelay: `${i * 0.05}s` }}
          >
            <Card className="hover:shadow-lg transition-all border-gray-100 overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Bus Info */}
                  <div className="lg:w-56">
                    <p className="font-bold text-gray-900">{bus.operator}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{bus.type}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {bus.rating}
                      </Badge>
                      <span className={`text-xs font-medium ${bus.seatsAvailable < 10 ? 'text-red-500' : 'text-green-600'}`}>
                        {bus.seatsAvailable} seats left
                      </span>
                    </div>
                    {/* Amenities */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {bus.amenities.map(a => (
                        <span key={a} className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          {amenityIcons[a]} {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Times */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{bus.departure}</p>
                      <p className="text-xs text-gray-400">{bus.from}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-xs text-gray-500">{bus.duration}</p>
                      <div className="w-full flex items-center gap-1 my-1">
                        <div className="w-2 h-2 rounded-full border-2 border-green-300" />
                        <div className="flex-1 border-t-2 border-dashed border-green-300" />
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{bus.arrival}</p>
                      <p className="text-xs text-gray-400">{bus.to}</p>
                    </div>
                  </div>

                  {/* Price & Book */}
                  <div className="flex items-center justify-between lg:flex-col lg:items-end lg:w-36 gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-gray-900">₹{bus.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">per seat</p>
                    </div>
                    <a
                      href="https://www.redbus.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-green-200 transition-all hover:shadow-xl"
                    >
                      Book on RedBus <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Bus className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No buses found</h3>
          <p className="text-sm text-gray-400 mt-1">Try different routes or dates</p>
        </div>
      )}
    </div>
  );
}
