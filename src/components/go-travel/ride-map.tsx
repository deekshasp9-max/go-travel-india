'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RideMapProps {
  pickupCoords: [number, number] | null;
  destCoords: [number, number] | null;
  driverPosition: [number, number] | null;
  status: string;
}

// Fix leaflet default marker icon
const createIcon = (color: string, size = 32, emoji?: string) => {
  if (emoji) {
    return L.divIcon({
      html: `<div style="font-size:${size}px;text-align:center;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${emoji}</div>`,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export function RideMap({ pickupCoords, destCoords, driverPosition, status }: RideMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const driverRouteRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter: [number, number] = pickupCoords || [28.6139, 77.2090]; // Delhi default
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

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map when coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Update pickup marker
    if (pickupCoords) {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng(pickupCoords);
      } else {
        pickupMarkerRef.current = L.marker(pickupCoords, {
          icon: createIcon('#10b981', 28),
        }).addTo(map).bindPopup('<b>📍 Pickup</b>');
      }
    }

    // Update destination marker
    if (destCoords) {
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng(destCoords);
      } else {
        destMarkerRef.current = L.marker(destCoords, {
          icon: createIcon('#ef4444', 28),
        }).addTo(map).bindPopup('<b>🏁 Destination</b>');
      }
    }

    // Draw route line between pickup and destination
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
      // Fit bounds to show both markers
      const bounds = L.latLngBounds([pickupCoords, destCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupCoords) {
      map.setView(pickupCoords, 15);
    }
  }, [pickupCoords, destCoords]);

  // Update driver position
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (driverPosition) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(driverPosition);
      } else {
        driverMarkerRef.current = L.marker(driverPosition, {
          icon: createIcon('#8b5cf6', 24),
        }).addTo(map).bindPopup('<b>🚗 Driver</b>');
      }
    }
  }, [driverPosition]);

  // Invalidate size when status changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setTimeout(() => {
      map.invalidateSize();
      if (pickupCoords) {
        map.setView(pickupCoords, 15);
      }
    }, 100);
  }, [status, pickupCoords]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: '300px' }}
    />
  );
}
