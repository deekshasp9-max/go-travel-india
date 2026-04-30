'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGoTravelStore } from '@/store/go-travel-store';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  MapPin, Bike, Car, Clock, Shield, Phone,
  Crosshair, Play, Pause, ChevronRight,
  Star, Bell, CheckCircle, Loader2, Map, CreditCard
} from 'lucide-react';
import { rideRates } from '@/data/mock-data';
import PaymentModal from '@/components/go-travel/payment-modal';

// Demo route: Delhi Connaught Place to India Gate
const DEMO_PICKUP: [number, number] = [28.6315, 77.2167];
const DEMO_DEST: [number, number] = [28.6129, 77.2295];
const DEMO_PICKUP_NAME = "Connaught Place, New Delhi";
const DEMO_DEST_NAME = "India Gate, New Delhi";

// Points along the route for simulation
const ROUTE_POINTS: [number, number][] = [
  [28.6315, 77.2167], [28.6308, 77.2182], [28.6298, 77.2198],
  [28.6288, 77.2212], [28.6275, 77.2225], [28.6262, 77.2238],
  [28.6250, 77.2248], [28.6238, 77.2258], [28.6225, 77.2268],
  [28.6215, 77.2278], [28.6205, 77.2285], [28.6195, 77.2290],
  [28.6185, 77.2292], [28.6175, 77.2293], [28.6165, 77.2294],
  [28.6155, 77.2294], [28.6145, 77.2295], [28.6135, 77.2295],
  [28.6129, 77.2295],
];

// Inline map component - loads leaflet entirely client-side
function LiveMap({ pickupCoords, destCoords, driverPosition }: {
  pickupCoords: [number, number] | null;
  destCoords: [number, number] | null;
  driverPosition: [number, number] | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const propsRef = useRef({ pickupCoords, destCoords, driverPosition });

  // Keep ref in sync with latest props
  useEffect(() => {
    propsRef.current = { pickupCoords, destCoords, driverPosition };
  }, [pickupCoords, destCoords, driverPosition]);

  // Initialize map once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let map: any = null;
    let markers: Record<string, any> = {};
    let polyline: any = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    // Dynamic import of leaflet (client-side only, no SSR)
    import('leaflet')
      .then((mod) => {
        if (cancelled) return;
        const L = mod.default || mod;
        const center: [number, number] = propsRef.current.pickupCoords || [28.6139, 77.2090];

        map = L.map(container, { center, zoom: 14, zoomControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OSM',
        }).addTo(map);
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Fix map rendering after a delay
        setTimeout(() => {
          if (!cancelled && map) {
            map.invalidateSize();
            setStatus('ready');
          }
        }, 500);

        // Update markers every 500ms via polling
        pollTimer = setInterval(() => {
          if (cancelled || !map) return;
          const p = propsRef.current;
          try {
            // Pickup
            if (p.pickupCoords) {
              const key = 'pickup';
              if (markers[key]) { markers[key].setLatLng(p.pickupCoords); }
              else { markers[key] = L.marker(p.pickupCoords, { icon: L.divIcon({ html: '<div style="width:24px;height:24px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>', className: '', iconSize: [24, 24], iconAnchor: [12, 12] }) }).addTo(map); }
            }
            // Destination
            if (p.destCoords) {
              const key = 'dest';
              if (markers[key]) { markers[key].setLatLng(p.destCoords); }
              else { markers[key] = L.marker(p.destCoords, { icon: L.divIcon({ html: '<div style="width:24px;height:24px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>', className: '', iconSize: [24, 24], iconAnchor: [12, 12] }) }).addTo(map); }
            }
            // Route line
            if (p.pickupCoords && p.destCoords) {
              if (polyline) { polyline.setLatLngs([p.pickupCoords, p.destCoords]); }
              else { polyline = L.polyline([p.pickupCoords, p.destCoords], { color: '#6b7280', weight: 3, opacity: 0.5, dashArray: '10, 10' }).addTo(map); }
              try { map.fitBounds(L.latLngBounds([p.pickupCoords, p.destCoords]), { padding: [50, 50] }); } catch (_) {}
            } else if (p.pickupCoords) {
              map.setView(p.pickupCoords, 15);
            }
            // Driver
            if (p.driverPosition) {
              const key = 'driver';
              if (markers[key]) { markers[key].setLatLng(p.driverPosition); }
              else { markers[key] = L.marker(p.driverPosition, { icon: L.divIcon({ html: '<div style="width:20px;height:20px;background:#8b5cf6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(map); }
            } else if (markers['driver']) {
              markers['driver'].remove();
              delete markers['driver'];
            }
          } catch (_) { /* ignore marker errors */ }
        }, 500);
      })
      .catch((err: any) => {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg(err?.message || 'Map load failed');
        }
      });

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (map) { try { map.remove(); } catch (_) {} }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Map container - always rendered so ref is always valid */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-[3px] border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400 mt-3">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-xl z-10">
          <div className="text-center p-6">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="text-lg font-bold text-red-600">Map Unavailable</p>
            <p className="text-sm text-gray-500 mt-1">{errorMsg}</p>
            <button onClick={() => { setStatus('loading'); setErrorMsg(''); window.location.reload(); }} className="mt-3 text-sm text-emerald-600 underline">Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function RidesPage() {
  const { rideState, setRideState, driverPosition, setDriverPosition } = useGoTravelStore();
  const { user } = useAuthStore();
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosMessage, setSosMessage] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [rideStep, setRideStep] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [ridePaid, setRidePaid] = useState(false);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const vehicleTypes = [
    { key: 'bike', ...rideRates.bike, desc: 'Quick & affordable' },
    { key: 'auto', ...rideRates.auto, desc: 'Comfortable 3-wheeler' },
    { key: 'car', ...rideRates.car, desc: 'AC sedan ride' },
    { key: 'carPremium', ...rideRates.carPremium, desc: 'Premium AC sedan' },
  ];

  const selectedRate = vehicleTypes.find(v => v.key === rideState.rideType) || vehicleTypes[1];

  const calculateFare = useCallback((distance: number, type: string) => {
    const rate = vehicleTypes.find(v => v.key === type) || vehicleTypes[1];
    return Math.round(rate.baseFare + distance * rate.perKm);
  }, []);

  const getGPSLocation = useCallback(() => {
    setGpsLoading(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setRideState({ pickupCoords: [pos.coords.latitude, pos.coords.longitude], pickup: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
          setGpsLoading(false);
        },
        () => {
          setRideState({ pickupCoords: DEMO_PICKUP, pickup: DEMO_PICKUP_NAME });
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setRideState({ pickupCoords: DEMO_PICKUP, pickup: DEMO_PICKUP_NAME });
      setGpsLoading(false);
    }
  }, [setRideState]);

  const searchRide = () => {
    if (!rideState.pickup || !rideState.destination) return;
    const pickupCoords = rideState.pickupCoords || DEMO_PICKUP;
    const destCoords = rideState.destCoords || DEMO_DEST;
    const R = 6371;
    const dLat = ((destCoords[0] - pickupCoords[0]) * Math.PI) / 180;
    const dLon = ((destCoords[1] - pickupCoords[1]) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((pickupCoords[0] * Math.PI) / 180) * Math.cos((destCoords[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Math.round(R * c * 10) / 10;
    const fare = calculateFare(distance, rideState.rideType);
    setRideState({ pickupCoords, destCoords, distance, fare, status: 'searching' });
    setTimeout(() => { setRideState({ status: 'confirming' }); }, 3000);
  };

  const startRide = () => {
    fetch('/api/rides', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideType: rideState.rideType, pickup: rideState.pickup, destination: rideState.destination, pickupLat: rideState.pickupCoords?.[0] || 0, pickupLng: rideState.pickupCoords?.[1] || 0, destLat: rideState.destCoords?.[0] || 0, destLng: rideState.destCoords?.[1] || 0, distance: rideState.distance, fare: rideState.fare, status: 'ongoing' }),
    }).then(r => r.json()).then(data => { setRideState({ status: 'ongoing', currentRideId: data.id }); setDriverPosition(rideState.pickupCoords || DEMO_PICKUP); setRideStep(0); }).catch(console.error);
  };

  const completeRide = useCallback(() => {
    setRideState({ status: 'completed' });
    setDriverPosition(null);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setSimulating(false);
  }, [setRideState, setDriverPosition]);

  const simulateDriver = useCallback(() => {
    if (simulating) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setSimulating(false);
      return;
    }
    setSimulating(true);
    setRideStep(0);
    let step = 0;
    simIntervalRef.current = setInterval(() => {
      if (step >= ROUTE_POINTS.length - 1) {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        setSimulating(false);
        completeRide();
        return;
      }
      setDriverPosition(ROUTE_POINTS[step]);
      setRideStep(step);
      step++;
    }, 2000);
  }, [simulating, completeRide, setDriverPosition]);

  const resetRide = () => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    setRideState({ status: 'idle', pickup: '', destination: '', pickupCoords: null, destCoords: null, distance: 0, fare: 0, currentRideId: null });
    setDriverPosition(null);
    setSimulating(false);
    setRideStep(0);
    setRidePaid(false);
  };

  const handleRidePayment = useCallback(async (method: string) => {
    setShowPayment(false);
    setRidePaid(true);
    try {
      await fetch('/api/rides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rideState.currentRideId, paymentMethod: method, paymentStatus: 'paid' }),
      });
    } catch { /* silent */ }
  }, [rideState.currentRideId]);

  const triggerSOS = async () => {
    const position = driverPosition || rideState.pickupCoords || DEMO_PICKUP;
    setSosTriggered(true);
    try {
      await fetch('/api/sos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rideId: rideState.currentRideId, latitude: position[0], longitude: position[1], message: 'SOS Alert!' }) });
      setSosMessage('Alert Sent! Emergency services notified.');
    } catch { setSosMessage('Alert recorded locally.'); }
    setTimeout(() => setSosTriggered(false), 5000);
  };

  const useDemoRoute = () => {
    setRideState({ pickupCoords: DEMO_PICKUP, pickup: DEMO_PICKUP_NAME, destCoords: DEMO_DEST, destination: DEMO_DEST_NAME });
  };

  useEffect(() => { return () => { if (simIntervalRef.current) clearInterval(simIntervalRef.current); }; }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Bike className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Local Rides</h1>
            <p className="text-gray-500 text-sm">Bike, Auto &amp; Car — real-time tracking</p>
          </div>
        </div>
        {rideState.status === 'ongoing' && (
          <Button variant="destructive" size="sm" onClick={triggerSOS} className="animate-pulse">
            <Bell className="w-4 h-4 mr-1" /> SOS
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Booking Form */}
          {(rideState.status === 'idle' || rideState.status === 'searching' || rideState.status === 'confirming') && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4 text-white">
                    <h2 className="font-bold text-lg">Book a Ride</h2>
                    <p className="text-purple-100 text-sm">Enter your pickup &amp; destination</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">PICKUP LOCATION</label>
                      <div className="relative">
                        <Input value={rideState.pickup} onChange={(e) => setRideState({ pickup: e.target.value })} placeholder="Enter pickup location" className="pr-20" />
                        <Button variant="ghost" size="sm" onClick={getGPSLocation} className="absolute right-1 top-0.5 text-purple-600 h-7 text-xs" disabled={gpsLoading}>
                          {gpsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />} GPS
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">DESTINATION</label>
                      <Input value={rideState.destination} onChange={(e) => setRideState({ destination: e.target.value })} placeholder="Where to?" />
                    </div>
                    <Button variant="outline" size="sm" onClick={useDemoRoute} className="w-full text-xs border-dashed border-purple-200 text-purple-600 hover:bg-purple-50">
                      🎓 Use Demo Route (CP → India Gate)
                    </Button>
                    <Separator />
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-2 block">SELECT VEHICLE</label>
                      <div className="grid grid-cols-2 gap-2">
                        {vehicleTypes.map(v => (
                          <button key={v.key} onClick={() => setRideState({ rideType: v.key, fare: rideState.distance ? calculateFare(rideState.distance, v.key) : 0 })}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${rideState.rideType === v.key ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                            <div className="text-2xl mb-1">{v.icon}</div>
                            <p className="font-bold text-sm text-gray-900">{v.name}</p>
                            <p className="text-[10px] text-gray-400">{v.desc}</p>
                            <div className="flex items-center gap-1 mt-1"><Clock className="w-3 h-3 text-gray-400" /><span className="text-[10px] text-gray-500">ETA: {v.eta}</span></div>
                          </button>
                        ))}
                      </div>
                    </div>
                    {rideState.distance > 0 && (
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Distance</span><span className="font-semibold">{rideState.distance} km</span></div>
                        <div className="flex items-center justify-between text-sm mt-1"><span className="text-gray-600">Base Fare</span><span className="font-semibold">₹{selectedRate.baseFare}</span></div>
                        <div className="flex items-center justify-between text-sm mt-1"><span className="text-gray-600">Rate ({selectedRate.perKm}₹/km)</span><span className="font-semibold">₹{Math.round(rideState.distance * selectedRate.perKm)}</span></div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between"><span className="font-bold text-gray-900">Total Fare</span><span className="text-xl font-extrabold text-emerald-600">₹{rideState.fare}</span></div>
                      </div>
                    )}
                    {rideState.status === 'idle' && (
                      <Button onClick={searchRide} disabled={!rideState.pickup || !rideState.destination} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-xl font-bold text-base shadow-lg shadow-purple-200 disabled:opacity-50">
                        {rideState.pickup && rideState.destination ? `Search ${selectedRate.icon} ${selectedRate.name}` : 'Enter pickup & destination'}
                      </Button>
                    )}
                    {rideState.status === 'searching' && (
                      <div className="text-center py-6">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
                        <p className="font-bold text-gray-900">Finding your driver...</p>
                        <p className="text-sm text-gray-500">Searching nearby {selectedRate.name.toLowerCase()}s</p>
                      </div>
                    )}
                    {rideState.status === 'confirming' && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                        <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                          <div className="text-3xl mb-2">🚗</div>
                          <p className="font-bold text-gray-900">Driver Found!</p>
                          <div className="flex items-center justify-center gap-3 mt-2 text-sm text-gray-600">
                            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-xs font-bold">RK</div>
                            <div className="text-left"><p className="font-semibold text-gray-900">Rajesh Kumar</p><div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-xs">4.8</span></div></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">White Swift • DL-01-AB-1234</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Fare</p><p className="font-bold text-sm">₹{rideState.fare}</p></div>
                          <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Distance</p><p className="font-bold text-sm">{rideState.distance} km</p></div>
                          <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">ETA</p><p className="font-bold text-sm">~{Math.ceil(rideState.distance / 30 * 60)} min</p></div>
                        </div>
                        <Button onClick={startRide} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-bold text-base"><Play className="w-5 h-5 mr-2" /> Start Ride</Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Ongoing Ride */}
          {rideState.status === 'ongoing' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-lg overflow-hidden border-l-4 border-l-emerald-500">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs font-semibold"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-1.5" />RIDE IN PROGRESS</Badge>
                    <Button variant="ghost" size="sm" onClick={resetRide} className="text-xs text-gray-400">Cancel</Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" /><div><p className="text-xs text-gray-400">Pickup</p><p className="text-sm font-medium">{rideState.pickup}</p></div></div>
                    <div className="flex items-start gap-2"><div className="w-3 h-3 bg-red-500 rounded-full mt-1.5 flex-shrink-0" /><div><p className="text-xs text-gray-400">Destination</p><p className="text-sm font-medium">{rideState.destination}</p></div></div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">{selectedRate.icon} {selectedRate.name}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Distance</p><p className="font-bold text-sm">{rideState.distance} km</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Fare</p><p className="font-bold text-sm text-emerald-600">₹{rideState.fare}</p></div>
                  </div>
                  <Button onClick={simulateDriver} variant={simulating ? 'destructive' : 'default'} className={`w-full py-3 rounded-xl font-bold text-sm ${simulating ? '' : 'bg-amber-500 hover:bg-amber-600'}`}>
                    {simulating ? <><Pause className="w-4 h-4 mr-2" /> Stop Simulation</> : <><Play className="w-4 h-4 mr-2" /> Simulate Driver (Demo)</>}
                  </Button>
                  <p className="text-[10px] text-center text-gray-400">Moves the vehicle icon along the route every 2 seconds</p>
                  {rideStep > 0 && <div className="bg-amber-50 rounded-lg p-2 border border-amber-100"><p className="text-xs text-amber-700 font-medium">🚗 Driver en route — {rideStep}/{ROUTE_POINTS.length - 1} checkpoints</p></div>}
                  <Button onClick={completeRide} variant="outline" className="w-full py-3 rounded-xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"><CheckCircle className="w-4 h-4 mr-2" /> Complete Ride</Button>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">Your Driver</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-lg font-bold text-purple-700">RK</div>
                  <div className="flex-1"><p className="font-bold text-gray-900">Rajesh Kumar</p><div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-xs">4.8 • 2,341 trips</span></div><p className="text-xs text-gray-400">White Swift • DL-01-AB-1234</p></div>
                  <Button size="icon" variant="outline" className="rounded-full h-10 w-10 text-green-600 border-green-200 hover:bg-green-50"><Phone className="w-4 h-4" /></Button>
                </div>
              </CardContent></Card>
            </motion.div>
          )}

          {/* Completed */}
          {rideState.status === 'completed' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-0 shadow-lg overflow-hidden"><CardContent className="p-0">
                <div className={`p-6 text-center text-white ${ridePaid ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8" /></motion.div>
                  <h2 className="text-2xl font-extrabold">Ride Completed!</h2>
                  <p className="text-sm mt-1 opacity-90">{ridePaid ? 'Payment received. Thanks for riding with Go Travel!' : 'Please complete your payment below'}</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-500">Pickup</span><span className="text-sm font-medium">{rideState.pickup}</span></div>
                  <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-500">Destination</span><span className="text-sm font-medium">{rideState.destination}</span></div>
                  <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-500">Distance</span><span className="text-sm font-medium">{rideState.distance} km</span></div>
                  <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-500">Vehicle</span><span className="text-sm font-medium">{selectedRate.icon} {selectedRate.name}</span></div>
                  <Separator />
                  <div className="flex items-center justify-between py-2"><span className="text-lg font-bold text-gray-900">Total Fare</span><span className="text-2xl font-extrabold text-emerald-600">₹{rideState.fare}</span></div>
                  {ridePaid ? (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Paid Successfully</Badge>
                    </div>
                  ) : (
                    <Button onClick={() => setShowPayment(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-xl font-bold text-base shadow-lg shadow-emerald-200">
                      <CreditCard className="w-5 h-5 mr-2" /> Pay ₹{rideState.fare}
                    </Button>
                  )}
                  <Button onClick={resetRide} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-xl font-bold">Book Another Ride <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </CardContent></Card>
            </motion.div>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-lg overflow-hidden h-[400px] sm:h-[500px] lg:h-[calc(100vh-180px)] lg:min-h-[500px]">
            <LiveMap
              pickupCoords={rideState.pickupCoords}
              destCoords={rideState.destCoords}
              driverPosition={driverPosition}
            />
          </Card>
        </div>
      </div>

      {/* SOS Floating */}
      {(rideState.status === 'ongoing' || rideState.status === 'confirming') && (
        <button onClick={triggerSOS} className="fixed bottom-24 lg:bottom-8 right-4 z-50 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl shadow-red-200 flex items-center justify-center animate-pulse hover:scale-110" title="Emergency SOS">
          <Bell className="w-6 h-6" />
        </button>
      )}

      {/* Payment Modal */}
      <PaymentModal
        amount={rideState.fare}
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handleRidePayment}
      />

      {/* SOS Dialog */}
      {sosTriggered && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-sm w-full border-0 shadow-2xl"><CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Shield className="w-10 h-10 text-red-600" /></div>
            <h2 className="text-xl font-extrabold text-red-600">SOS Alert Sent!</h2>
            <p className="text-sm text-gray-600 mt-2">Your location shared with emergency contacts.</p>
            {sosMessage && <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2 mt-3">{sosMessage}</p>}
            <Button onClick={() => setSosTriggered(false)} className="mt-4 w-full" variant="outline">Dismiss</Button>
          </CardContent></Card>
        </motion.div>
      )}
    </div>
  );
}
