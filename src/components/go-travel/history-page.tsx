'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  History, Bike, Car, MapPin, Clock, IndianRupee, Shield, 
  Calendar, AlertTriangle, ChevronRight, RotateCcw, Trash2
} from 'lucide-react';
import { useGoTravelStore } from '@/store/go-travel-store';

interface RideRecord {
  id: string;
  rideType: string;
  pickup: string;
  destination: string;
  distance: number;
  fare: number;
  status: string;
  createdAt: string;
}

interface SOSRecord {
  id: string;
  rideId: string | null;
  latitude: number;
  longitude: number;
  message: string;
  createdAt: string;
}

interface ItineraryRecord {
  id: string;
  city: string;
  title: string;
  days: number;
  createdAt: string;
}

export function HistoryPage() {
  const { setCurrentPage } = useGoTravelStore();
  const [rides, setRides] = useState<RideRecord[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSRecord[]>([]);
  const [savedItineraries, setSavedItineraries] = useState<ItineraryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setRides(data.rides || []);
      setSosAlerts(data.sosAlerts || []);
      setSavedItineraries(data.savedItineraries || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const rideTypeIcons: Record<string, string> = {
    bike: '🏍️',
    auto: '🛺',
    car: '🚗',
    carPremium: '✨',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <History className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Records</h1>
          <p className="text-gray-500 text-sm">Ride history, SOS alerts & planned itineraries</p>
        </div>
      </div>

      <Tabs defaultValue="rides" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex h-auto p-1 bg-gray-100 rounded-xl">
          <TabsTrigger value="rides" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Rides ({rides.length})
          </TabsTrigger>
          <TabsTrigger value="sos" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            SOS Alerts ({sosAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="itineraries" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Itineraries ({savedItineraries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rides" className="mt-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400 mt-3">Loading rides...</p>
            </div>
          ) : rides.length === 0 ? (
            <EmptyState
              icon={<Bike className="w-12 h-12 text-gray-200" />}
              title="No rides yet"
              description="Book your first local ride to see it here"
              actionLabel="Book a Ride"
              onAction={() => setCurrentPage('rides')}
            />
          ) : (
            <div className="space-y-3">
              {rides.map((ride, i) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-all border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-xl flex-shrink-0">
                          {rideTypeIcons[ride.rideType] || '🚗'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-[10px] capitalize">{ride.rideType.replace('Premium', ' Premium')}</Badge>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ride.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                              <span className="text-gray-600 truncate">{ride.pickup}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-red-500 rounded-full" />
                              <span className="text-gray-600 truncate">{ride.destination}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>{ride.distance} km</span>
                            <span className="text-gray-300">|</span>
                            <span className="font-bold text-emerald-600">₹{ride.fare}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sos" className="mt-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400 mt-3">Loading alerts...</p>
            </div>
          ) : sosAlerts.length === 0 ? (
            <EmptyState
              icon={<Shield className="w-12 h-12 text-gray-200" />}
              title="No SOS alerts"
              description="Your safety alerts will appear here"
              actionLabel=""
            />
          ) : (
            <div className="space-y-3">
              {sosAlerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="border-l-4 border-l-red-500 border-t-0 border-r-0 border-b-0 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-red-100 text-red-700 text-[10px]">SOS Alert</Badge>
                            <span className="text-[10px] text-gray-400">
                              {new Date(alert.createdAt).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mt-1">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                          </div>
                          {alert.rideId && (
                            <p className="text-[10px] text-gray-400 mt-1">Ride ID: {alert.rideId.slice(0, 8)}...</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="itineraries" className="mt-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400 mt-3">Loading...</p>
            </div>
          ) : savedItineraries.length === 0 ? (
            <EmptyState
              icon={<MapPin className="w-12 h-12 text-gray-200" />}
              title="No saved itineraries"
              description="Explore destinations and save your favorite itineraries"
              actionLabel="Explore India"
              onAction={() => setCurrentPage('tourism')}
            />
          ) : (
            <div className="space-y-3">
              {savedItineraries.map((itin, i) => (
                <motion.div
                  key={itin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-all border-gray-100">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{itin.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{itin.city}</span>
                          <span>•</span>
                          <span>{itin.days} Days</span>
                          <span>•</span>
                          <span>{new Date(itin.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentPage('tourism')} className="text-xs text-emerald-600">
                        View <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  icon, title, description, actionLabel, onAction
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-400">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} className="mt-4">
          {actionLabel} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
