'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Plane, ArrowRight, ExternalLink, Filter,
} from 'lucide-react';
import { flights } from '@/data/mock-data';
import { indianCities, type IndianCity } from '@/data/mock-data';
import { CitySearchInput } from '@/components/go-travel/city-search';

function flightCityValue(city: IndianCity): string {
  if (city.code) return `${city.name} (${city.code})`;
  return city.name;
}

export function FlightsPage() {
  const [from, setFrom] = useState('Delhi (DEL)');
  const [to, setTo] = useState('Mumbai (BOM)');
  const [sortBy, setSortBy] = useState<'price' | 'departure' | 'duration'>('price');
  const [stops, setStops] = useState<'all' | '0' | '1'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = flights.filter(f => {
      if (from && !f.from.toLowerCase().includes(from.toLowerCase())) return false;
      if (to && !f.to.toLowerCase().includes(to.toLowerCase())) return false;
      if (stops !== 'all' && f.stops !== parseInt(stops)) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'departure') return a.departure.localeCompare(b.departure);
      return a.duration.localeCompare(b.duration);
    });

    return result;
  }, [from, to, sortBy, stops]);

  const cheapest = filtered.length > 0 ? Math.min(...filtered.map(f => f.price)) : 0;

  const bookUrl = (airline: string) => {
    const urls: Record<string, string> = {
      'Air India': 'https://www.airindia.in/',
      'IndiGo': 'https://www.goindigo.in/',
      'SpiceJet': 'https://www.spicejet.com/',
      'Vistara': 'https://www.airvistara.com/',
    };
    return urls[airline] || 'https://www.makemytrip.com/flights/';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <Plane className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Flight Search</h1>
          <p className="text-gray-500 text-sm">Compare prices across 50+ airlines</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-lg mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <CitySearchInput
                  value={from}
                  onChange={(name) => {
                    const city = indianCities.find(c => c.name === name);
                    setFrom(city ? flightCityValue(city) : name);
                  }}
                  label="From"
                  placeholder="Search departure city..."
                />
              </div>
              <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
              <div className="flex-1 w-full">
                <CitySearchInput
                  value={to}
                  onChange={(name) => {
                    const city = indianCities.find(c => c.name === name);
                    setTo(city ? flightCityValue(city) : name);
                  }}
                  label="To"
                  placeholder="Search destination city..."
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="text-xs font-semibold text-orange-100 mb-1 block">Date</label>
                <Input type="date" className="bg-white" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters & Sort */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs"
          >
            <Filter className="w-3 h-3 mr-1" /> Filters {stops !== 'all' && '(1 active)'}
          </Button>
          {stops !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {stops === '0' ? 'Non-stop' : '1 Stop'}
              <button onClick={() => setStops('all')} className="ml-1 text-gray-400 hover:text-gray-600">✕</button>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort:</span>
          {[
            { key: 'price' as const, label: 'Price' },
            { key: 'departure' as const, label: 'Departure' },
            { key: 'duration' as const, label: 'Duration' },
          ].map(s => (
            <Button
              key={s.key}
              variant={sortBy === s.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(s.key)}
              className={`text-xs h-7 ${sortBy === s.key ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 animate-fade-in-down" style={{ animationDuration: '0.2s' }}>
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Stops</h3>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: '0', label: 'Non-stop' },
                { key: '1', label: '1 Stop' },
              ].map(s => (
                <Button
                  key={s.key}
                  variant={stops === s.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStops(s.key as typeof stops)}
                  className={stops === s.key ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-500 mb-4">
        {filtered.length} flights found
        {cheapest > 0 && (
          <span className="ml-2 text-emerald-600 font-semibold">
            Starting from ₹{cheapest.toLocaleString()}
          </span>
        )}
      </div>

      {/* Flight Cards */}
      <div className="space-y-3">
        {filtered.map((flight, i) => (
          <div
            key={flight.id}
            className="animate-fade-in-up"
            style={{ animationDuration: '0.3s', animationDelay: `${i * 0.05}s` }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-gray-100 overflow-hidden group">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Airline Info */}
                  <div className="flex items-center gap-3 lg:w-48">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-xl">
                      ✈️
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{flight.airline}</p>
                      <p className="text-xs text-gray-400">{flight.flightNo}</p>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="hidden lg:block h-12" />

                  {/* Flight Times */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{flight.departure}</p>
                      <p className="text-xs text-gray-400">{flight.from.split('(')[0].trim()}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-xs text-gray-500 mb-1">{flight.duration}</p>
                      <div className="w-full flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full border-2 border-gray-300" />
                        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                        {flight.stops === 0 ? (
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        ) : (
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-1">{flight.stops} stop</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{flight.class}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{flight.arrival}</p>
                      <p className="text-xs text-gray-400">{flight.to.split('(')[0].trim()}</p>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="hidden lg:block h-12" />

                  {/* Price & Book */}
                  <div className="flex items-center justify-between lg:flex-col lg:items-end lg:w-40 gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-gray-900">₹{flight.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">per person</p>
                    </div>
                    <a
                      href={bookUrl(flight.airline)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-200 transition-all hover:shadow-xl hover:scale-[1.02]"
                    >
                      Book Now <ExternalLink className="w-3.5 h-3.5" />
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
          <Plane className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No flights found</h3>
          <p className="text-sm text-gray-400 mt-1">Try changing your search filters</p>
        </div>
      )}
    </div>
  );
}
