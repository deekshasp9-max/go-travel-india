'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface RideMapProps {
  pickupCoords: [number, number] | null;
  destCoords: [number, number] | null;
  driverPosition: [number, number] | null;
  status: string;
}

export function RideMap({ pickupCoords, destCoords, driverPosition, status }: RideMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const propsRef = useRef({ pickupCoords, destCoords, driverPosition, status });

  // Keep props ref in sync
  useEffect(() => {
    propsRef.current = { pickupCoords, destCoords, driverPosition, status };
  }, [pickupCoords, destCoords, driverPosition, status]);

  const makeIcon = useCallback((color: string, size: number, L: any) => {
    return L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, []);

  // Initialize map once
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let destroyed = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let L: any = null;

    async function initMap() {
      try {
        // Dynamically import leaflet from npm (client-side only)
        const leaflet = await import('leaflet');
        L = leaflet.default || leaflet;

        if (destroyed || !el || !L) return;

        const defaultCenter: [number, number] = propsRef.current.pickupCoords || [28.6139, 77.2090];

        const map = L.map(el, {
          center: defaultCenter,
          zoom: 14,
          zoomControl: false,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);
        mapRef.current = map;

        // Fix map size after a short delay
        setTimeout(() => {
          if (!destroyed && map) {
            map.invalidateSize();
            setMapState('ready');
          }
        }, 400);

        // Poll props ref to update markers
        pollTimer = setInterval(() => {
          if (destroyed || !map || !L) return;
          const p = propsRef.current;

          try {
            // Pickup marker (green)
            if (p.pickupCoords) {
              const icon = makeIcon('#10b981', 28, L);
              if (pickupMarkerRef.current) {
                pickupMarkerRef.current.setLatLng(p.pickupCoords);
              } else {
                pickupMarkerRef.current = L.marker(p.pickupCoords, { icon }).addTo(map);
              }
            }

            // Destination marker (red)
            if (p.destCoords) {
              const icon = makeIcon('#ef4444', 28, L);
              if (destMarkerRef.current) {
                destMarkerRef.current.setLatLng(p.destCoords);
              } else {
                destMarkerRef.current = L.marker(p.destCoords, { icon }).addTo(map);
              }
            }

            // Route line
            if (p.pickupCoords && p.destCoords) {
              if (routeLineRef.current) {
                routeLineRef.current.setLatLngs([p.pickupCoords, p.destCoords]);
              } else {
                routeLineRef.current = L.polyline([p.pickupCoords, p.destCoords], {
                  color: '#6b7280', weight: 3, opacity: 0.5, dashArray: '10, 10',
                }).addTo(map);
              }
              try {
                map.fitBounds(L.latLngBounds([p.pickupCoords, p.destCoords]), { padding: [50, 50] });
              } catch (_) { /* ignore bounds error */ }
            } else if (p.pickupCoords) {
              map.setView(p.pickupCoords, 15);
            }

            // Driver marker (purple)
            if (p.driverPosition) {
              const icon = makeIcon('#8b5cf6', 24, L);
              if (driverMarkerRef.current) {
                driverMarkerRef.current.setLatLng(p.driverPosition);
              } else {
                driverMarkerRef.current = L.marker(p.driverPosition, { icon }).addTo(map);
              }
            } else {
              // Remove driver marker if driverPosition becomes null
              if (driverMarkerRef.current) {
                driverMarkerRef.current.remove();
                driverMarkerRef.current = null;
              }
            }
          } catch (markerErr) {
            // Silently handle marker update errors
            console.warn('Marker update error:', markerErr);
          }
        }, 500);

      } catch (err: any) {
        console.error('Leaflet load error:', err);
        if (!destroyed) {
          setMapState('error');
          setErrorMsg(err.message || 'Failed to load map');
        }
      }
    }

    initMap();

    return () => {
      destroyed = true;
      if (pollTimer) clearInterval(pollTimer);
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) { /* ignore */ }
        mapRef.current = null;
      }
      pickupMarkerRef.current = null;
      destMarkerRef.current = null;
      driverMarkerRef.current = null;
      routeLineRef.current = null;
    };
  }, [makeIcon]);

  // Loading state
  if (mapState === 'loading') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-3">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (mapState === 'error') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-xl">
        <div className="text-center p-6">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-lg font-bold text-red-600">Map Unavailable</p>
          <p className="text-sm text-gray-500 mt-1">{errorMsg || 'Could not load the map'}</p>
          <button
            onClick={() => { setMapState('loading'); setErrorMsg(''); }}
            className="mt-3 text-sm text-emerald-600 underline hover:text-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ready state - render the map container
  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
    />
  );
}
