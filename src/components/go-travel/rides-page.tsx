'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGoTravelStore } from '@/store/go-travel-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Shield, Phone, Crosshair, Play, Pause,
  ChevronRight, Star, Bell, CheckCircle, Loader2,
  CreditCard, Navigation, X, Search, Car
} from 'lucide-react';
import { rideRates } from '@/data/mock-data';
import PaymentModal from '@/components/go-travel/payment-modal';
import { toast } from '@/hooks/use-toast';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const BENGALURU_CENTER: [number, number] = [12.9716, 77.5946];

const BENGALURU_SPOTS = [
  { name: 'MG Road Metro Station', lat: 12.9756, lng: 77.6062 },
  { name: 'Koramangala 4th Block', lat: 12.9352, lng: 77.6245 },
  { name: 'Indiranagar 100 Feet Road', lat: 12.9784, lng: 77.6408 },
  { name: 'Whitefield ITPL', lat: 12.9698, lng: 77.7500 },
  { name: 'Electronic City Phase 1', lat: 12.8399, lng: 77.6770 },
  { name: 'HSR Layout Sector 2', lat: 12.9116, lng: 77.6389 },
  { name: 'Jayanagar 4th Block', lat: 12.9250, lng: 77.5938 },
  { name: 'Marathahalli Bridge', lat: 12.9591, lng: 77.6974 },
  { name: 'Hebbal Flyover', lat: 13.0358, lng: 77.5970 },
  { name: 'Majestic Bus Stand', lat: 12.9767, lng: 77.5713 },
  { name: 'Cubbon Park', lat: 12.9763, lng: 77.5929 },
  { name: 'Brigade Road', lat: 12.9719, lng: 77.6070 },
  { name: 'Kempegowda Airport', lat: 13.1986, lng: 77.7066 },
  { name: 'Yeswanthpur Junction', lat: 13.0306, lng: 77.5562 },
];

const DRIVERS = [
  { name: 'Rajesh Kumar', init: 'RK', rating: 4.8, trips: 2341, vehicle: 'White Swift Dzire', plate: 'KA-01-AB-1234' },
  { name: 'Suresh M', init: 'SM', rating: 4.6, trips: 1856, vehicle: 'Silver WagonR', plate: 'KA-03-CD-5678' },
  { name: 'Venkat R', init: 'VR', rating: 4.9, trips: 4120, vehicle: 'Red Hyundai i10', plate: 'KA-05-EF-9012' },
  { name: 'Mohammed Ali', init: 'MA', rating: 4.7, trips: 3089, vehicle: 'Black Celerio', plate: 'KA-02-GH-3456' },
  { name: 'Kiran P', init: 'KP', rating: 4.5, trips: 1250, vehicle: 'Blue Nexon', plate: 'KA-04-IJ-7890' },
  { name: 'Arun B', init: 'AB', rating: 4.8, trips: 5672, vehicle: 'White Baleno', plate: 'KA-51-KL-2345' },
];

// ═══════════════════════════════════════════════════════════════
// TYPES & HELPERS
// ═══════════════════════════════════════════════════════════════

type Phase = 'idle' | 'searching' | 'approaching' | 'arrived' | 'riding' | 'completed';

interface GeoResult { displayName: string; lat: number; lng: number }

function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function randomDriverPos(pickup: [number, number]): [number, number] {
  const angle = Math.random() * 2 * Math.PI;
  const dist = 0.006 + Math.random() * 0.012;
  return [
    pickup[0] + Math.cos(angle) * dist,
    pickup[1] + Math.sin(angle) * dist / Math.cos(pickup[0] * Math.PI / 180),
  ];
}

function toLeaflet(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

function sampleRoute(coords: [number, number][], maxPoints: number = 60): [number, number][] {
  if (coords.length <= maxPoints) return coords;
  const step = Math.ceil(coords.length / maxPoints);
  const sampled = coords.filter((_, i) => i % step === 0);
  const last = coords[coords.length - 1];
  if (sampled[sampled.length - 1] !== last) sampled.push(last);
  return sampled;
}

function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

async function fetchRoute(from: [number, number], to: [number, number]) {
  const url = `/api/route?pickupLat=${from[0]}&pickupLng=${from[1]}&destLat=${to[0]}&destLng=${to[1]}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Route fetch failed');
  return res.json();
}

// ═══════════════════════════════════════════════════════════════
// SEARCH SUGGESTIONS COMPONENT
// ═══════════════════════════════════════════════════════════════

function SearchSuggestions({
  results, loading, onSelect, onClose
}: {
  results: GeoResult[]; loading: boolean;
  onSelect: (r: GeoResult) => void; onClose: () => void;
}) {
  if (!results.length && !loading) return null;
  return (
    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-48 overflow-y-auto">
      {loading && <div className="p-3 text-center"><Loader2 className="w-4 h-4 animate-spin inline text-purple-500" /></div>}
      {results.map((r, i) => (
        <button key={i} className="w-full text-left px-3 py-2.5 text-sm hover:bg-purple-50 border-b border-gray-50 last:border-0 flex items-start gap-2"
          onMouseDown={() => { onSelect(r); onClose(); }}>
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 leading-snug line-clamp-2">{r.displayName}</span>
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INLINE LEAFLET MAP
// ═══════════════════════════════════════════════════════════════

function RideMap({
  center, pickupCoords, destCoords, driverPos, userLoc,
  routeCoords, approachCoords,
}: {
  center: [number, number];
  pickupCoords: [number, number] | null;
  destCoords: [number, number] | null;
  driverPos: [number, number] | null;
  userLoc: [number, number] | null;
  routeCoords: [number, number][] | null;
  approachCoords: [number, number][] | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState('');
  const pRef = useRef({ center, pickupCoords, destCoords, driverPos, userLoc, routeCoords, approachCoords });

  useEffect(() => { pRef.current = { center, pickupCoords, destCoords, driverPos, userLoc, routeCoords, approachCoords }; }, [center, pickupCoords, destCoords, driverPos, userLoc, routeCoords, approachCoords]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let dead = false;
    let map: any = null;
    const mk: Record<string, any> = {};
    const pl: Record<string, any> = {};
    let timer: ReturnType<typeof setInterval> | null = null;

    import('leaflet').then((mod) => {
      if (dead) return;
      const L = mod.default || mod;
      map = L.map(el, { center: pRef.current.center, zoom: 14, zoomControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(map);
      L.control.zoom({ position: 'topright' }).addTo(map);
      setTimeout(() => { if (!dead && map) { map.invalidateSize(); setStatus('ready'); } }, 500);

      timer = setInterval(() => {
        if (dead || !map) return;
        const p = pRef.current;
        try {
          // User current location (blue dot)
          if (p.userLoc) {
            const k = 'user';
            if (mk[k]) mk[k].setLatLng(p.userLoc);
            else mk[k] = L.marker(p.userLoc, { icon: L.divIcon({ html: '<div style="width:14px;height:14px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 3px rgba(59,130,246,.35),0 2px 6px rgba(0,0,0,.2)"></div>', className: '', iconSize: [14, 14], iconAnchor: [7, 7] }), zIndexOffset: 1000 }).addTo(map);
          }
          // Pickup (green pin)
          if (p.pickupCoords) {
            const k = 'pk';
            if (mk[k]) mk[k].setLatLng(p.pickupCoords);
            else mk[k] = L.marker(p.pickupCoords, { icon: L.divIcon({ html: '<div style="width:12px;height:40px;position:relative"><div style="width:32px;height:32px;background:#10b981;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.25)"></div><div style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);width:12px;height:4px;background:rgba(0,0,0,.15);border-radius:50%;filter:blur(2px)"></div></div>', className: '', iconSize: [32, 44], iconAnchor: [16, 44] }) }).addTo(map);
          }
          // Destination (red pin)
          if (p.destCoords) {
            const k = 'dst';
            if (mk[k]) mk[k].setLatLng(p.destCoords);
            else mk[k] = L.marker(p.destCoords, { icon: L.divIcon({ html: '<div style="width:12px;height:40px;position:relative"><div style="width:32px;height:32px;background:#ef4444;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.25)"></div><div style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);width:12px;height:4px;background:rgba(0,0,0,.15);border-radius:50%;filter:blur(2px)"></div></div>', className: '', iconSize: [32, 44], iconAnchor: [16, 44] }) }).addTo(map);
          }
          // Driver (purple car)
          if (p.driverPos) {
            const k = 'drv';
            if (mk[k]) mk[k].setLatLng(p.driverPos);
            else mk[k] = L.marker(p.driverPos, { icon: L.divIcon({ html: '<div style="width:40px;height:40px;background:#7c3aed;border:3px solid #fff;border-radius:50%;box-shadow:0 3px 12px rgba(124,58,237,.45);display:flex;align-items:center;justify-content:center;font-size:18px">🚗</div>', className: '', iconSize: [40, 40], iconAnchor: [20, 20] }), zIndexOffset: 500 }).addTo(map);
          } else if (mk['drv']) { mk['drv'].remove(); delete mk['drv']; }

          // Main route polyline (pickup → destination)
          if (p.routeCoords && p.routeCoords.length > 1) {
            if (pl['rt']) pl['rt'].setLatLngs(p.routeCoords);
            else pl['rt'] = L.polyline(p.routeCoords, { color: '#3b82f6', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }).addTo(map);
          } else if (pl['rt']) { pl['rt'].remove(); delete pl['rt']; }

          // Approach polyline (driver → pickup, dashed purple)
          if (p.approachCoords && p.approachCoords.length > 1) {
            if (pl['ap']) pl['ap'].setLatLngs(p.approachCoords);
            else pl['ap'] = L.polyline(p.approachCoords, { color: '#7c3aed', weight: 4, opacity: 0.7, dashArray: '10,10' }).addTo(map);
          } else if (pl['ap']) { pl['ap'].remove(); delete pl['ap']; }

          // Fit bounds
          const allPoints: [number, number][] = [];
          if (p.driverPos) allPoints.push(p.driverPos);
          if (p.pickupCoords) allPoints.push(p.pickupCoords);
          if (p.destCoords) allPoints.push(p.destCoords);
          if (allPoints.length >= 2) {
            try { map.fitBounds(L.latLngBounds(allPoints), { padding: [60, 60], maxZoom: 15 }); } catch (_) {}
          } else if (p.pickupCoords) { map.setView(p.pickupCoords, 15); }
          else if (p.userLoc) { map.setView(p.userLoc, 15); }
        } catch (e) { /* marker update error */ }
      }, 350);
    }).catch((e: any) => { if (!dead) { setStatus('error'); setErr(e?.message || 'Failed'); } });

    return () => { dead = true; if (timer) clearInterval(timer); if (map) try { map.remove(); } catch (_) {} };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50 z-10">
          <div className="text-center"><div className="w-10 h-10 border-[3px] border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" /><p className="text-sm text-gray-400 mt-3">Loading map...</p></div>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 z-10">
          <div className="text-center p-6"><div className="text-4xl mb-3">🗺️</div><p className="text-lg font-bold text-red-600">Map Error</p><p className="text-sm text-gray-500 mt-1">{err}</p></div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN RIDES PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

const VEHICLES = [
  { key: 'bike', ...rideRates.bike, desc: 'Quick & affordable' },
  { key: 'auto', ...rideRates.auto, desc: 'Comfortable 3-wheeler' },
  { key: 'car', ...rideRates.car, desc: 'AC sedan ride' },
  { key: 'carPremium', ...rideRates.carPremium, desc: 'Premium AC sedan' },
];

export function RidesPage() {
  const { setCurrentPage } = useGoTravelStore();

  // ── Map & Location ──
  const [mapCenter, setMapCenter] = useState<[number, number]>(BENGALURU_CENTER);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);

  // ── Pickup & Destination ──
  const [pickupName, setPickupName] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [destName, setDestName] = useState('');
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  // ── Search state ──
  const [pkQuery, setPkQuery] = useState('');
  const [pkResults, setPkResults] = useState<GeoResult[]>([]);
  const [pkSearching, setPkSearching] = useState(false);
  const [pkFocused, setPkFocused] = useState(false);

  const [dstQuery, setDstQuery] = useState('');
  const [dstResults, setDstResults] = useState<GeoResult[]>([]);
  const [dstSearching, setDstSearching] = useState(false);
  const [dstFocused, setDstFocused] = useState(false);

  const pkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Vehicle & Fare ──
  const [vehicleType, setVehicleType] = useState('auto');
  const [distance, setDistance] = useState(0);
  const [fare, setFare] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);

  // ── Ride Phase ──
  const [phase, setPhase] = useState<Phase>('idle');
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [driver, setDriver] = useState<(typeof DRIVERS)[0] | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [approachCoords, setApproachCoords] = useState<[number, number][] | null>(null);
  const [animating, setAnimating] = useState(false);
  const [remainingDist, setRemainingDist] = useState(0);

  // ── Payment & SOS ──
  const [showPayment, setShowPayment] = useState(false);
  const [ridePaid, setRidePaid] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [rideId, setRideId] = useState<string | null>(null);

  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vehicle = VEHICLES.find(v => v.key === vehicleType) || VEHICLES[1];

  // ══════════════════════════════════════════════════════════════
  // GPS AUTO-DETECT ON MOUNT
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    setGpsLoading(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLoc(loc);
          setMapCenter(loc);
          setPickupCoords(loc);
          setPickupName(`${loc[0].toFixed(4)}, ${loc[1].toFixed(4)}`);
          setGpsLoading(false);
          toast({ title: '📍 Location Detected', description: 'Showing your current location on the map.' });
        },
        () => {
          // GPS denied → default Bengaluru
          setUserLoc(BENGALURU_CENTER);
          setMapCenter(BENGALURU_CENTER);
          setGpsLoading(false);
          toast({ title: 'Using Default Location', description: 'Showing Bengaluru. Tap GPS to retry.', variant: 'default' });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserLoc(BENGALURU_CENTER);
      setMapCenter(BENGALURU_CENTER);
      setGpsLoading(false);
    }
  }, []);

  // ══════════════════════════════════════════════════════════════
  // GEOCODE SEARCH (debounced)
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (pkTimer.current) clearTimeout(pkTimer.current);
    if (!pkQuery.trim() || pkQuery.length < 3) { setPkResults([]); return; }
    setPkSearching(true);
    pkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(pkQuery + ' Bengaluru')}`);
        if (res.ok) { const d = await res.json(); setPkResults(d.results || []); }
      } catch { setPkResults([]); }
      setPkSearching(false);
    }, 400);
    return () => { if (pkTimer.current) clearTimeout(pkTimer.current); };
  }, [pkQuery]);

  useEffect(() => {
    if (dstTimer.current) clearTimeout(dstTimer.current);
    if (!dstQuery.trim() || dstQuery.length < 3) { setDstResults([]); return; }
    setDstSearching(true);
    dstTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(dstQuery + ' Bengaluru')}`);
        if (res.ok) { const d = await res.json(); setDstResults(d.results || []); }
      } catch { setDstResults([]); }
      setDstSearching(false);
    }, 400);
    return () => { if (dstTimer.current) clearTimeout(dstTimer.current); };
  }, [dstQuery]);

  // ══════════════════════════════════════════════════════════════
  // LOCATION HELPERS
  // ══════════════════════════════════════════════════════════════
  const retryGPS = useCallback(() => {
    setGpsLoading(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLoc(loc);
          setMapCenter(loc);
          setPickupCoords(loc);
          setPickupName(`${loc[0].toFixed(4)}, ${loc[1].toFixed(4)}`);
          setGpsLoading(false);
        },
        () => { setGpsLoading(false); },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else { setGpsLoading(false); }
  }, []);

  const selectPickup = useCallback((r: GeoResult) => {
    const c: [number, number] = [r.lat, r.lng];
    setPickupCoords(c);
    setPickupName(r.displayName.split(',').slice(0, 2).join(','));
    setPkQuery('');
    setPkResults([]);
  }, []);

  const selectDest = useCallback((r: GeoResult) => {
    const c: [number, number] = [r.lat, r.lng];
    setDestCoords(c);
    setDestName(r.displayName.split(',').slice(0, 2).join(','));
    setDstQuery('');
    setDstResults([]);
  }, []);

  // ══════════════════════════════════════════════════════════════
  // ANIMATION ENGINE
  // ══════════════════════════════════════════════════════════════
  const stopAnim = useCallback(() => {
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
    setAnimating(false);
  }, []);

  const animateRoute = useCallback((
    coords: [number, number][],
    onDone: () => void,
    msPerStep: number = 150,
    onStep?: (idx: number) => void,
  ) => {
    stopAnim();
    const pts = sampleRoute(coords, 55);
    let idx = 0;
    setAnimating(true);
    animRef.current = setInterval(() => {
      if (idx >= pts.length) {
        stopAnim();
        onDone();
        return;
      }
      setDriverPos(pts[idx]);
      if (onStep) onStep(idx);
      idx++;
    }, msPerStep);
  }, [stopAnim]);

  // ══════════════════════════════════════════════════════════════
  // RIDE FLOW
  // ══════════════════════════════════════════════════════════════

  // 1) Search for a ride
  const searchRide = useCallback(async () => {
    if (!pickupCoords || !destCoords) return;
    setPhase('searching');

    // Fetch road route from pickup to destination
    try {
      const routeData = await fetchRoute(pickupCoords, destCoords);
      const leafletCoords = toLeaflet(routeData.geometry);
      setRouteCoords(leafletCoords);
      setDistance(routeData.distance);
      setRouteDuration(routeData.duration);
      const calcFare = Math.round(vehicle.baseFare + routeData.distance * vehicle.perKm);
      setFare(calcFare);
    } catch {
      // Fallback: haversine distance
      const d = haversine(pickupCoords, destCoords);
      setDistance(d);
      setFare(Math.round(vehicle.baseFare + d * vehicle.perKm));
      setRouteDuration(Math.round((d / 25) * 60));
    }

    // Simulate "finding driver" for 3 seconds
    await new Promise(r => setTimeout(r, 3000));

    const chosenDriver = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
    const drvStart = randomDriverPos(pickupCoords);
    setDriver(chosenDriver);
    setDriverPos(drvStart);

    // Fetch route from driver start → pickup
    try {
      const appRoute = await fetchRoute(drvStart, pickupCoords);
      setApproachCoords(toLeaflet(appRoute.geometry));
    } catch { /* no approach line shown */ }

    setPhase('approaching');
    toast({ title: '🚗 Driver Found!', description: `${chosenDriver.name} is ${Math.round(haversine(drvStart, pickupCoords) * 1000)}m away. Heading to your pickup.` });
  }, [pickupCoords, destCoords, vehicle]);

  // 2) Start approaching animation (auto-called)
  useEffect(() => {
    if (phase !== 'approaching' || !driverPos || !pickupCoords || !approachCoords) return;
    const totalDist = haversine(driverPos, pickupCoords);
    setRemainingDist(totalDist);

    animateRoute(approachCoords, () => {
      setDriverPos(pickupCoords);
      setApproachCoords(null);
      setRemainingDist(0);
      setPhase('arrived');
      toast({ title: '🟢 Driver Arrived!', description: `${driver?.name} is at your pickup point.` });
    }, 120, (idx) => {
      // Update remaining distance
      if (approachCoords[idx]) {
        setRemainingDist(haversine(approachCoords[idx], pickupCoords));
      }
    });

    return () => stopAnim();
  }, [phase]);

  // 3) Start ride (user clicks after driver arrives)
  const startRide = useCallback(async () => {
    if (!pickupCoords || !destCoords) return;
    setPhase('riding');

    // Save ride to DB
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideType: vehicleType, pickup: pickupName, destination: destName,
          pickupLat: pickupCoords[0], pickupLng: pickupCoords[1],
          destLat: destCoords[0], destLng: destCoords[1],
          distance, fare, status: 'ongoing',
        }),
      });
      const data = await res.json();
      if (data.id) setRideId(data.id);
    } catch { /* silent */ }

    // If no route yet, fetch it
    let rideCoords = routeCoords;
    if (!rideCoords) {
      try {
        const routeData = await fetchRoute(pickupCoords, destCoords);
        rideCoords = toLeaflet(routeData.geometry);
        setRouteCoords(rideCoords);
      } catch { /* ride without route line */ }
    }

    if (rideCoords && rideCoords.length > 1) {
      setRemainingDist(distance);
      animateRoute(rideCoords, () => {
        setDriverPos(destCoords);
        setRemainingDist(0);
        setPhase('completed');
        toast({ title: '🏁 Ride Complete!', description: `You have arrived at ${destName}` });
      }, 180, (idx) => {
        if (rideCoords[idx] && destCoords) {
          setRemainingDist(haversine(rideCoords[idx], destCoords));
        }
      });
    }
  }, [pickupCoords, destCoords, pickupName, destName, vehicleType, distance, fare, routeCoords, destName, animateRoute]);

  // 4) Complete ride manually
  const completeRide = useCallback(() => {
    stopAnim();
    if (destCoords) setDriverPos(destCoords);
    setPhase('completed');
    toast({ title: '🏁 Ride Complete!', description: `You have arrived at ${destName}` });
  }, [stopAnim, destCoords, destName]);

  // 5) Reset everything
  const resetRide = useCallback(() => {
    stopAnim();
    setPhase('idle');
    setDriverPos(null);
    setDriver(null);
    setRouteCoords(null);
    setApproachCoords(null);
    setDistance(0);
    setFare(0);
    setRouteDuration(0);
    setDestName('');
    setDestCoords(null);
    setRemainingDist(0);
    setRidePaid(false);
    setRideId(null);
    setAnimating(false);
  }, [stopAnim]);

  // 6) Payment
  const handlePayment = useCallback(async (method: string) => {
    setShowPayment(false);
    setRidePaid(true);
    try {
      await fetch('/api/rides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rideId, paymentMethod: method, status: 'completed' }),
      });
    } catch { /* silent */ }
    toast({ title: '✅ Payment Successful', description: `Paid ${formatINR(fare)} via ${method}` });
  }, [rideId, fare]);

  // 7) SOS
  const triggerSOS = useCallback(() => {
    setSosOpen(true);
    try {
      fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId, latitude: driverPos?.[0] || 0, longitude: driverPos?.[1] || 0, message: 'SOS Alert!' }),
      });
    } catch { /* silent */ }
    setTimeout(() => setSosOpen(false), 4000);
  }, [rideId, driverPos]);

  // ══════════════════════════════════════════════════════════════
  // QUICK SELECT: use a Bengaluru spot as pickup/destination
  // ══════════════════════════════════════════════════════════════
  const quickSelect = useCallback((spot: typeof BENGALURU_SPOTS[0], as: 'pickup' | 'dest') => {
    const c: [number, number] = [spot.lat, spot.lng];
    if (as === 'pickup') {
      setPickupCoords(c);
      setPickupName(spot.name);
      setPkQuery('');
      setPkResults([]);
    } else {
      setDestCoords(c);
      setDestName(spot.name);
      setDstQuery('');
      setDstResults([]);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopAnim(), [stopAnim]);

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Navigation className="w-5 h-5 text-purple-600" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Local Rides</h1>
            <p className="text-gray-500 text-sm">Bengaluru · GPS Tracking · Road Routes</p>
          </div>
        </div>
        {(phase === 'approaching' || phase === 'riding') && (
          <Button variant="destructive" size="sm" onClick={triggerSOS} className="animate-pulse"><Bell className="w-4 h-4 mr-1" /> SOS</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ─── LEFT PANEL ─── */}
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">

          {/* ── BOOKING FORM (idle / searching / approaching) ── */}
          {(phase === 'idle' || phase === 'searching' || phase === 'approaching') && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4 text-white">
                    <h2 className="font-bold text-lg">Book a Ride</h2>
                    <p className="text-purple-100 text-sm">Enter pickup & destination in Bengaluru</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Pickup */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">PICKUP LOCATION</label>
                      <div className="relative">
                        <Input
                          value={pickupName || pkQuery}
                          onChange={(e) => { setPickupName(''); setPkQuery(e.target.value); }}
                          onFocus={() => setPkFocused(true)}
                          onBlur={() => setTimeout(() => setPkFocused(false), 200)}
                          placeholder="Enter pickup location"
                          className="pr-20"
                        />
                        <Button variant="ghost" size="sm" onClick={retryGPS} className="absolute right-1 top-0.5 text-purple-600 h-7 text-xs" disabled={gpsLoading}>
                          {gpsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />} GPS
                        </Button>
                        {pkFocused && (pkResults.length > 0 || pkSearching) && (
                          <SearchSuggestions results={pkResults} loading={pkSearching} onSelect={selectPickup} onClose={() => setPkFocused(false)} />
                        )}
                      </div>
                    </div>

                    {/* Destination */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">DESTINATION</label>
                      <div className="relative">
                        <Input
                          value={destName || dstQuery}
                          onChange={(e) => { setDestName(''); setDstQuery(e.target.value); }}
                          onFocus={() => setDstFocused(true)}
                          onBlur={() => setTimeout(() => setDstFocused(false), 200)}
                          placeholder="Where to?"
                        />
                        {dstFocused && (dstResults.length > 0 || dstSearching) && (
                          <SearchSuggestions results={dstResults} loading={dstSearching} onSelect={selectDest} onClose={() => setDstFocused(false)} />
                        )}
                      </div>
                    </div>

                    {/* Quick Spots */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">QUICK SELECT</label>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {BENGALURU_SPOTS.map((s, i) => (
                          <button key={i} onClick={() => quickSelect(s, destCoords ? 'pickup' : 'dest')}
                            className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors whitespace-nowrap">
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Vehicle Selection */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-2 block">SELECT VEHICLE</label>
                      <div className="grid grid-cols-2 gap-2">
                        {VEHICLES.map(v => (
                          <button key={v.key} onClick={() => setVehicleType(v.key)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${vehicleType === v.key ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                            <div className="text-2xl mb-1">{v.icon}</div>
                            <p className="font-bold text-sm text-gray-900">{v.name}</p>
                            <p className="text-[10px] text-gray-400">{v.desc}</p>
                            <div className="flex items-center gap-1 mt-1"><Clock className="w-3 h-3 text-gray-400" /><span className="text-[10px] text-gray-500">ETA: {v.eta}</span></div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fare Breakdown */}
                    {distance > 0 && (
                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                        <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Distance</span><span className="font-semibold">{distance} km</span></div>
                        <div className="flex items-center justify-between text-sm mt-1"><span className="text-gray-600">Base Fare</span><span className="font-semibold">₹{vehicle.baseFare}</span></div>
                        <div className="flex items-center justify-between text-sm mt-1"><span className="text-gray-600">Rate ({vehicle.perKm}₹/km)</span><span className="font-semibold">₹{Math.round(distance * vehicle.perKm)}</span></div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between"><span className="font-bold text-gray-900">Total Fare</span><span className="text-xl font-extrabold text-purple-600">₹{fare}</span></div>
                        {routeDuration > 0 && <p className="text-[10px] text-gray-400 mt-1">Estimated time: ~{routeDuration} min via road route</p>}
                      </div>
                    )}

                    {/* Search Button */}
                    {phase === 'idle' && (
                      <Button onClick={searchRide} disabled={!pickupCoords || !destCoords}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-xl font-bold text-base shadow-lg shadow-purple-200 disabled:opacity-50">
                        {pickupCoords && destCoords ? `Search ${vehicle.icon} ${vehicle.name}` : 'Enter pickup & destination'}
                      </Button>
                    )}

                    {/* Searching State */}
                    {phase === 'searching' && (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
                        <p className="font-bold text-gray-900">Finding your driver...</p>
                        <p className="text-sm text-gray-500">Searching nearby {vehicle.name.toLowerCase()}s</p>
                      </div>
                    )}

                    {/* Approaching State */}
                    {phase === 'approaching' && driver && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center gap-1 mb-2">
                            <Badge className="bg-purple-100 text-purple-700 text-xs"><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-1" />DRIVER APPROACHING</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-lg font-bold text-purple-700">{driver.init}</div>
                            <div>
                              <p className="font-bold text-gray-900">{driver.name}</p>
                              <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-xs">{driver.rating} · {driver.trips.toLocaleString()} trips</span></div>
                              <p className="text-xs text-gray-400">{driver.vehicle} · {driver.plate}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-amber-700 font-medium">🚗 Driver is on the way</span>
                            <span className="font-bold text-amber-700">{remainingDist > 0.1 ? `${(remainingDist * 1000).toFixed(0)}m away` : 'Arriving...'}</span>
                          </div>
                          <div className="mt-2 w-full bg-amber-200 rounded-full h-1.5">
                            <motion.div className="bg-amber-500 h-1.5 rounded-full" initial={{ width: '0%' }} animate={{ width: remainingDist > 0.1 ? '70%' : '100%' }} transition={{ duration: 1 }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Fare</p><p className="font-bold text-sm">₹{fare}</p></div>
                          <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Distance</p><p className="font-bold text-sm">{distance} km</p></div>
                          <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">ETA</p><p className="font-bold text-sm">~{routeDuration} min</p></div>
                        </div>

                        <Button disabled className="w-full bg-gray-200 text-gray-500 py-5 rounded-xl font-bold cursor-not-allowed">
                          <Car className="w-4 h-4 mr-2" /> Waiting for driver to arrive...
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── DRIVER ARRIVED ── */}
          {phase === 'arrived' && driver && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-lg overflow-hidden border-l-4 border-l-green-500">
                <CardContent className="p-4 space-y-3">
                  <div className="text-center py-3">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <h2 className="text-lg font-bold text-green-700">Driver has arrived!</h2>
                    <p className="text-sm text-gray-500">{driver.name} is waiting at your pickup point</p>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">{driver.init}</div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{driver.name}</p>
                      <p className="text-xs text-gray-400">{driver.vehicle} · {driver.plate}</p>
                    </div>
                    <Button size="icon" variant="outline" className="rounded-full h-9 w-9 text-green-600 border-green-200"><Phone className="w-4 h-4" /></Button>
                  </div>
                  <Button onClick={startRide} className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-xl font-bold text-base shadow-lg shadow-green-200">
                    <Play className="w-5 h-5 mr-2" /> Start Ride
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── RIDE IN PROGRESS ── */}
          {phase === 'riding' && driver && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <Card className="border-0 shadow-lg overflow-hidden border-l-4 border-l-blue-500">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-700 text-xs font-semibold"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1.5" />RIDE IN PROGRESS</Badge>
                    <span className="text-sm font-bold text-blue-700">{remainingDist > 0.1 ? `${remainingDist.toFixed(1)} km left` : 'Arriving...'}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2"><div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0" /><div><p className="text-xs text-gray-400">Pickup</p><p className="text-sm font-medium">{pickupName}</p></div></div>
                    <div className="flex items-start gap-2"><div className="w-3 h-3 bg-red-500 rounded-full mt-1.5 flex-shrink-0" /><div><p className="text-xs text-gray-400">Destination</p><p className="text-sm font-medium">{destName}</p></div></div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">{vehicle.icon} {vehicle.name}</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Distance</p><p className="font-bold text-sm">{distance} km</p></div>
                    <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Fare</p><p className="font-bold text-sm text-purple-600">₹{fare}</p></div>
                  </div>
                  <Button onClick={completeRide} variant="outline" className="w-full py-3 rounded-xl border-2 border-green-200 text-green-700 hover:bg-green-50 font-bold">
                    <CheckCircle className="w-4 h-4 mr-2" /> Complete Ride
                  </Button>
                </CardContent>
              </Card>
              {/* Driver Info Card */}
              <Card className="border-0 shadow-sm"><CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">Your Driver</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-lg font-bold text-purple-700">{driver.init}</div>
                  <div className="flex-1"><p className="font-bold text-gray-900">{driver.name}</p><div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-xs">{driver.rating} · {driver.trips.toLocaleString()} trips</span></div><p className="text-xs text-gray-400">{driver.vehicle} · {driver.plate}</p></div>
                  <Button size="icon" variant="outline" className="rounded-full h-10 w-10 text-green-600 border-green-200 hover:bg-green-50"><Phone className="w-4 h-4" /></Button>
                </div>
              </CardContent></Card>
            </motion.div>
          )}

          {/* ── RIDE COMPLETED ── */}
          {phase === 'completed' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-0 shadow-lg overflow-hidden"><CardContent className="p-0">
                <div className={`p-6 text-center text-white ${ridePaid ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8" /></motion.div>
                  <h2 className="text-2xl font-extrabold">Ride Completed!</h2>
                  <p className="text-sm mt-1 opacity-90">{ridePaid ? 'Payment received. Thanks for riding with Go Travel!' : 'Please complete your payment below'}</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-500">Pickup</span><span className="text-sm font-medium">{pickupName}</span></div>
                  <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-500">Destination</span><span className="text-sm font-medium">{destName}</span></div>
                  <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-500">Distance</span><span className="text-sm font-medium">{distance} km</span></div>
                  <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-500">Vehicle</span><span className="text-sm font-medium">{vehicle.icon} {vehicle.name}</span></div>
                  <Separator />
                  <div className="flex items-center justify-between py-2"><span className="text-lg font-bold text-gray-900">Total Fare</span><span className="text-2xl font-extrabold text-purple-600">₹{fare}</span></div>
                  {ridePaid ? (
                    <div className="bg-green-50 rounded-xl p-3 border border-green-200 text-center">
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Paid Successfully</Badge>
                    </div>
                  ) : (
                    <Button onClick={() => setShowPayment(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-xl font-bold text-base shadow-lg shadow-purple-200">
                      <CreditCard className="w-5 h-5 mr-2" /> Pay ₹{fare}
                    </Button>
                  )}
                  <Button onClick={resetRide} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-xl font-bold">
                    Book Another Ride <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent></Card>
            </motion.div>
          )}
        </div>

        {/* ─── MAP ─── */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <Card className="border-0 shadow-lg overflow-hidden h-[55vh] sm:h-[60vh] lg:h-[calc(100vh-160px)] lg:min-h-[500px]">
            <RideMap
              center={mapCenter}
              pickupCoords={pickupCoords}
              destCoords={destCoords}
              driverPos={driverPos}
              userLoc={userLoc}
              routeCoords={routeCoords}
              approachCoords={approachCoords}
            />
            {/* GPS Loading Overlay */}
            {gpsLoading && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                <Badge className="bg-white shadow-lg border px-3 py-1.5 text-xs"><Loader2 className="w-3 h-3 animate-spin mr-1.5 text-purple-500" /> Detecting your location...</Badge>
              </div>
            )}
            {/* Location badge */}
            {userLoc && !gpsLoading && phase === 'idle' && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                <Badge className="bg-white/90 backdrop-blur shadow-lg border px-3 py-1.5 text-xs">
                  <MapPin className="w-3 h-3 mr-1 text-blue-500" /> Showing your location
                </Badge>
              </div>
            )}
            {/* Phase badge */}
            {phase === 'approaching' && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                <Badge className="bg-purple-600 text-white shadow-lg px-3 py-1.5 text-xs animate-pulse">
                  🚗 Driver approaching... {(remainingDist * 1000).toFixed(0)}m away
                </Badge>
              </div>
            )}
            {phase === 'riding' && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                <Badge className="bg-blue-600 text-white shadow-lg px-3 py-1.5 text-xs">
                  🛣️ Following road route · {remainingDist > 0.1 ? `${remainingDist.toFixed(1)} km left` : 'Arriving...'}
                </Badge>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* SOS Floating Button */}
      {(phase === 'approaching' || phase === 'riding') && (
        <button onClick={triggerSOS} className="fixed bottom-24 lg:bottom-8 right-4 z-50 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl shadow-red-200 flex items-center justify-center animate-pulse hover:scale-110" title="Emergency SOS">
          <Bell className="w-6 h-6" />
        </button>
      )}

      {/* Payment Modal */}
      <PaymentModal amount={fare} isOpen={showPayment} onClose={() => setShowPayment(false)} onSuccess={handlePayment} />

      {/* SOS Dialog */}
      <AnimatePresence>
        {sosOpen && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <Card className="max-w-sm w-full border-0 shadow-2xl"><CardContent className="p-6 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Shield className="w-10 h-10 text-red-600" /></div>
              <h2 className="text-xl font-extrabold text-red-600">SOS Alert Sent!</h2>
              <p className="text-sm text-gray-600 mt-2">Your location has been shared with emergency contacts.</p>
              <Button onClick={() => setSosOpen(false)} className="mt-4 w-full" variant="outline">Dismiss</Button>
            </CardContent></Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
