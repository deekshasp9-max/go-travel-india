'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Train, ArrowRight, Clock, ExternalLink, Filter } from 'lucide-react';
import { trains } from '@/data/mock-data';

export function TrainsPage() {
  const [from, setFrom] = useState('New Delhi (NDLS)');
  const [to, setTo] = useState('Mumbai Central (BCT)');
  const [sortBy, setSortBy] = useState<'price' | 'departure' | 'duration'>('price');
  const [type, setType] = useState<string>('all');

  const fromStations = [...new Set(trains.map(t => t.from))];
  const toStations = [...new Set(trains.map(t => t.to))];

  const filtered = useMemo(() => {
    let result = trains.filter(t => {
      if (from && !t.from.toLowerCase().includes(from.toLowerCase())) return false;
      if (to && !t.to.toLowerCase().includes(to.toLowerCase())) return false;
      if (type !== 'all' && t.type.toLowerCase() !== type) return false;
      return true;
    });
    result.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'departure') return a.departure.localeCompare(b.departure);
      return a.duration.localeCompare(b.duration);
    });
    return result;
  }, [from, to, sortBy, type]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Train className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Train Search</h1>
          <p className="text-gray-500 text-sm">IRCTC partner — compare & book easily</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-lg mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs font-semibold text-blue-100 mb-1 block">From Station</label>
                <Select value={from} onValueChange={setFrom}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fromStations.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 w-full">
                <label className="text-xs font-semibold text-blue-100 mb-1 block">To Station</label>
                <Select value={to} onValueChange={setTo}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {toStations.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-auto">
                <label className="text-xs font-semibold text-blue-100 mb-1 block">Journey Date</label>
                <input type="date" className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs text-gray-500">Train Type:</span>
        {['all', 'rajdhani', 'shatabdi', 'superfast', 'express'].map(t => (
          <Button
            key={t}
            variant={type === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType(t)}
            className={`text-xs h-7 capitalize ${type === t ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
          >
            {t}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-gray-500">Sort:</span>
          {[
            { key: 'price' as const, label: 'Price' },
            { key: 'departure' as const, label: 'Time' },
            { key: 'duration' as const, label: 'Duration' },
          ].map(s => (
            <Button key={s.key} variant={sortBy === s.key ? 'default' : 'ghost'} size="sm" onClick={() => setSortBy(s.key)}
              className={`text-xs h-7 ${sortBy === s.key ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}>
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} trains found</p>

      {/* Train Cards */}
      <div className="space-y-3">
        {filtered.map((train, i) => (
          <motion.div
            key={train.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all border-gray-100 overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Train Info */}
                  <div className="flex items-center gap-3 lg:w-52">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      train.type === 'Rajdhani' ? 'bg-red-100' :
                      train.type === 'Shatabdi' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      🚂
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{train.trainName}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">#{train.trainNo}</span>
                        <Badge variant="secondary" className="text-[10px]">{train.type}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Times */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{train.departure}</p>
                      <p className="text-xs text-gray-400">{train.from.split('(')[0].trim()}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-xs text-gray-500">{train.duration}</p>
                      <div className="w-full flex items-center gap-1 my-1">
                        <div className="w-2 h-2 rounded-full border-2 border-blue-300" />
                        <div className="flex-1 border-t-2 border-blue-300" />
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                      <div className="flex gap-1">
                        {train.days.slice(0, 5).map((d, idx) => (
                          <span key={idx} className="text-[9px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-medium">{d}</span>
                        ))}
                        {train.days.length > 5 && <span className="text-[9px] text-gray-400">+{train.days.length - 5}</span>}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{train.arrival}</p>
                      <p className="text-xs text-gray-400">{train.to.split('(')[0].trim()}</p>
                    </div>
                  </div>

                  {/* Classes & Price */}
                  <div className="lg:w-64 space-y-2">
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      {train.priceSL > 0 && (
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-[10px] text-gray-400">SL</p>
                          <p className="text-sm font-bold text-gray-900">₹{train.priceSL}</p>
                        </div>
                      )}
                      {train.price3A > 0 && (
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-[10px] text-gray-400">3A</p>
                          <p className="text-sm font-bold text-gray-900">₹{train.price3A}</p>
                        </div>
                      )}
                      {train.price2A > 0 && (
                        <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                          <p className="text-[10px] text-emerald-600">2A</p>
                          <p className="text-sm font-bold text-emerald-700">₹{train.price2A}</p>
                        </div>
                      )}
                    </div>
                    <a
                      href="https://www.irctc.co.in/nget/train-search"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 transition-all hover:shadow-xl"
                    >
                      Book on IRCTC <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Train className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No trains found</h3>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
