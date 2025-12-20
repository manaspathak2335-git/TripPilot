import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { flights, Flight } from '@/data/flights';
import { airports, getAirportByCode } from '@/data/airports';
import { getWeatherByAirport } from '@/data/weather';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FlightMapProps {
  selectedFlight: Flight | null;
  onFlightSelect: (flight: Flight) => void;
  selectedAirportCode: string | null;
}

const createFlightIcon = (status: string, heading: number) => {
  const color = status === 'In Air' ? '#3b82f6' : status === 'Delayed' ? '#f59e0b' : status === 'On Time' ? '#22c55e' : status === 'Boarding' ? '#06b6d4' : '#6b7280';
  return L.divIcon({
    className: 'flight-marker',
    html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;transform:rotate(${heading}deg)"><svg width="24" height="24" viewBox="0 0 24 24" fill="${color}"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createAirportIcon = (severity: string) => {
  const borderColor = severity === 'red' ? '#ef4444' : severity === 'yellow' ? '#f59e0b' : '#22c55e';
  return L.divIcon({
    className: 'airport-marker',
    html: `<div style="width:24px;height:24px;background:#1e293b;border:2px solid ${borderColor};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Dynamic import wrapper for react-leaflet components
const MapInner = lazy(() => import('./MapInner'));

export function FlightMap({ selectedFlight, onFlightSelect, selectedAirportCode }: FlightMapProps) {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    }>
      <MapInner 
        selectedFlight={selectedFlight} 
        onFlightSelect={onFlightSelect} 
        selectedAirportCode={selectedAirportCode}
        createFlightIcon={createFlightIcon}
        createAirportIcon={createAirportIcon}
      />
    </Suspense>
  );
}
