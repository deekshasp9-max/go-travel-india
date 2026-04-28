'use client';

import { useEffect, useRef, useState } from 'react';

interface RideMapProps {
  pickupCoords: [number, number] | null;
  destCoords: [number, number] | null;
  driverPosition: [number, number] | null;
  status: string;
}

export function RideMap({ pickupCoords, destCoords, driverPosition, status }: RideMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const [L, setL] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Dynamically load leaflet on client only
  useEffect(() => {
    let cancelled = false;
    async function loadLeaflet() {
      try {
        const leaflet = await import('leaflet');
        if (!cancelled) {
          setL(leaflet.default || leaflet);
        }
      } catch (err) {
        console.error('Failed to load leaflet:', err);
      }
    }
    loadLeaflet();
    return () => { cancelled = true; };
  }, []);

  // Initialize map once leaflet is loaded
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    try {
      const defaultCenter: [number, number] = pickupCoords || [28.6139, 77.2090];
      const map = L.map(mapRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      mapInstanceRef.current = map;

      // Small delay to ensure tile layer is ready
      setTimeout(() => {
        map.invalidateSize();
        setMapReady(true);
      }, 200);

      return () => {
        map.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      };
    } catch (err) {
      console.error('Failed to initialize map:', err);
    }
  }, [L]);

  // Create icon helper
  const createIcon = (color: string, size: number) => {
    if (!L) return null;
    return L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Update map when coordinates change
  useEffect(() => {
    if (!L || !mapReady) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      // Update pickup marker
      if (pickupCoords) {
        const icon = createIcon('#10b981', 28);
        if (!icon) return;
        if (pickupMarkerRef.current) {
          pickupMarkerRef.current.setLatLng(pickupCoords);
        } else {
          pickupMarkerRef.current = L.marker(pickupCoords, { icon })
            .addTo(map)
            .bindPopup('<b>Pickup</b>');
        }
      }

      // Update destination marker
      if (destCoords) {
        const icon = createIcon('#ef4444', 28);
        if (!icon) return;
        if (destMarkerRef.current) {
          destMarkerRef.current.setLatLng(destCoords);
        } else {
          destMarkerRef.current = L.marker(destCoords, { icon })
            .addTo(map)
            .bindPopup('<b>Destination</b>');
        }
      }

      // Draw route line
      if (pickupCoords && destCoords) {
        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs([pickupCoords, destCoords]);
        } else {
          routeLineRef.current = L.polyline([pickupCoords, destCoords], {
            color: '#6b7280',
            weight: 3,
            opacity: 0.5,
            dashArray: '10, 10',
          }).addTo(map);
        }
        const bounds = L.latLngBounds([pickupCoords, destCoords]);
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (pickupCoords) {
        map.setView(pickupCoords, 15);
      }
    } catch (err) {
      console.error('Error updating markers:', err);
    }
  }, [pickupCoords, destCoords, L, mapReady]);

  // Update driver position
  useEffect(() => {
    if (!L || !mapReady) return;
    const map = mapInstanceRef.current;
    if (!map || !driverPosition) return;

    try {
      const icon = createIcon('#8b5cf6', 24);
      if (!icon) return;
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(driverPosition);
      } else {
        driverMarkerRef.current = L.marker(driverPosition, { icon })
          .addTo(map)
          .bindPopup('<b>Driver</b>');
      }
    } catch (err) {
      console.error('Error updating driver:', err);
    }
  }, [driverPosition, L, mapReady]);

  // Invalidate size when status changes
  useEffect(() => {
    if (!mapReady) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
        if (pickupCoords) {
          map.setView(pickupCoords, 15);
        }
      } catch (err) {
        console.error('Error invalidating map size:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [status, pickupCoords, mapReady]);

  if (!L) {
    return (
      <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto" />
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
