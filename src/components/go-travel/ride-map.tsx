'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Declare global types for the leaflet loaded via CDN
declare global {
  interface Window {
    L: any;
    leafletLoadPromise: Promise<void> | null;
  }
}

interface RideMapProps {
  pickupCoords: [number, number] | null;
  destCoords: [number, number] | null;
  driverPosition: [number, number] | null;
  status: string;
}

function loadLeafletFromCDN(): Promise<void> {
  // If already loaded, return immediately
  if (window.L) return Promise.resolve();

  // If currently loading, return existing promise
  if (window.leafletLoadPromise) return window.leafletLoadPromise;

  window.leafletLoadPromise = new Promise<void>((resolve, reject) => {
    // Check if the script tag already exists
    if (document.getElementById('leaflet-cdn-script')) {
      const checkLoaded = setInterval(() => {
        if (window.L) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkLoaded);
        reject(new Error('Leaflet CDN load timeout'));
      }, 15000);
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-cdn-script';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Leaflet CDN'));
    document.head.appendChild(script);
  });

  return window.leafletLoadPromise;
}

export function RideMap({ pickupCoords, destCoords, driverPosition, status }: RideMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coordsRef = useRef({ pickupCoords, destCoords, driverPosition, status });

  // Keep ref in sync with props
  useEffect(() => {
    coordsRef.current = { pickupCoords, destCoords, driverPosition, status };
  }, [pickupCoords, destCoords, driverPosition, status]);

  // Create a colored circle marker icon
  const createIcon = useCallback((color: string, size: number) => {
    if (!window.L) return null;
    return window.L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, []);

  // Main: load leaflet + init map + setup update interval
  useEffect(() => {
    let map: any = null;
    let destroyed = false;
    let updateTimer: any = null;

    async function init() {
      try {
        await loadLeafletFromCDN();
        if (destroyed) return;

        const L = window.L;
        const el = mapRef.current;
        if (!el || !L) return;

        const { pickupCoords: pc, destCoords: dc } = coordsRef.current;
        const defaultCenter: [number, number] = pc || [28.6139, 77.2090];

        map = L.map(el, {
          center: defaultCenter,
          zoom: 14,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);
        mapInstanceRef.current = map;

        setTimeout(() => {
          if (destroyed || !map) return;
          map.invalidateSize();
          setReady(true);
        }, 300);

        // Poll-based update: check coords every 500ms and update markers
        updateTimer = setInterval(() => {
          if (destroyed || !map) return;
          const c = coordsRef.current;

          // Pickup marker
          if (c.pickupCoords) {
            const icon = createIcon('#10b981', 28);
            if (icon) {
              if (pickupMarkerRef.current) {
                pickupMarkerRef.current.setLatLng(c.pickupCoords);
              } else {
                pickupMarkerRef.current = L.marker(c.pickupCoords, { icon }).addTo(map);
              }
            }
          }

          // Dest marker
          if (c.destCoords) {
            const icon = createIcon('#ef4444', 28);
            if (icon) {
              if (destMarkerRef.current) {
                destMarkerRef.current.setLatLng(c.destCoords);
              } else {
                destMarkerRef.current = L.marker(c.destCoords, { icon }).addTo(map);
              }
            }
          }

          // Route line
          if (c.pickupCoords && c.destCoords) {
            if (routeLineRef.current) {
              routeLineRef.current.setLatLngs([c.pickupCoords, c.destCoords]);
            } else {
              routeLineRef.current = L.polyline([c.pickupCoords, c.destCoords], {
                color: '#6b7280', weight: 3, opacity: 0.5, dashArray: '10, 10',
              }).addTo(map);
            }
            try {
              map.fitBounds(L.latLngBounds([c.pickupCoords, c.destCoords]), { padding: [50, 50] });
            } catch (_) { /* ignore */ }
          } else if (c.pickupCoords) {
            map.setView(c.pickupCoords, 15);
          }

          // Driver marker
          if (c.driverPosition) {
            const icon = createIcon('#8b5cf6', 24);
            if (icon) {
              if (driverMarkerRef.current) {
                driverMarkerRef.current.setLatLng(c.driverPosition);
              } else {
                driverMarkerRef.current = L.marker(c.driverPosition, { icon }).addTo(map);
              }
            }
          }
        }, 500);

      } catch (err: any) {
        console.error('Map init error:', err);
        if (!destroyed) setError(err.message || 'Failed to load map');
      }
    }

    init();

    return () => {
      destroyed = true;
      if (updateTimer) clearInterval(updateTimer);
      if (map) {
        try { map.remove(); } catch (_) { /* ignore */ }
      }
      mapInstanceRef.current = null;
      pickupMarkerRef.current = null;
      destMarkerRef.current = null;
      driverMarkerRef.current = null;
      routeLineRef.current = null;
      setReady(false);
    };
  }, [createIcon]);

  if (error) {
    return (
      <div className="w-full h-full rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center" style={{ minHeight: '300px' }}>
        <div className="text-center p-4">
          <p className="text-lg font-bold text-red-600">Map Unavailable</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-sm text-emerald-600 underline">Retry</button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-3">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: '300px' }}
    />
  );
}
