import { useEffect, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { flights, Flight } from '@/data/flights';
import { airports, getAirportByCode } from '@/data/airports';
import { getWeatherByAirport } from '@/data/weather';

interface FlightMapProps {
  selectedFlight: Flight | null;
  onFlightSelect: (flight: Flight) => void;
  selectedAirportCode: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Air': return '#3b82f6';
    case 'Delayed': return '#f59e0b';
    case 'On Time': return '#22c55e';
    case 'Boarding': return '#06b6d4';
    default: return '#6b7280';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'red': return '#ef4444';
    case 'yellow': return '#f59e0b';
    default: return '#22c55e';
  }
};

export function FlightMap({ selectedFlight, onFlightSelect, selectedAirportCode }: FlightMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const inAirFlights = useMemo(() => flights.filter(f => f.status === 'In Air'), []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors'
          }
        },
        layers: [{
          id: 'osm-layer',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19
        }]
      },
      center: [78.9629, 20.5937], // India center
      zoom: 4.5,
      pitch: 0,
      bearing: 0
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      markersRef.current.forEach(m => m.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add airport markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add airport markers
    airports.forEach((airport) => {
      const weather = getWeatherByAirport(airport.code);
      const severity = weather?.severity || 'green';
      const borderColor = getSeverityColor(severity);

      const el = document.createElement('div');
      el.className = 'airport-marker';
      el.innerHTML = `
        <div style="width:28px;height:28px;background:#1e293b;border:3px solid ${borderColor};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="padding:8px;background:#0f172a;color:white;border-radius:8px;font-family:system-ui;">
          <strong style="font-size:14px;">${airport.code}</strong> - ${airport.city}
          ${weather ? `<p style="margin:4px 0 0;font-size:12px;">${weather.icon} ${weather.temperature}°C - ${weather.condition}</p>` : ''}
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([airport.lng, airport.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Add flight markers
    inAirFlights.forEach((flight) => {
      const color = getStatusColor(flight.status);
      const rotation = flight.heading - 90; // Adjust for SVG orientation

      const el = document.createElement('div');
      el.className = 'flight-marker';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;transform:rotate(${rotation}deg);filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="${color}">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
      `;

      el.addEventListener('click', () => onFlightSelect(flight));

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="padding:8px;background:#0f172a;color:white;border-radius:8px;font-family:system-ui;">
          <strong style="font-size:14px;">${flight.flightNumber}</strong>
          <p style="margin:4px 0 0;font-size:12px;">${flight.origin} → ${flight.destination}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">Alt: ${flight.altitude.toLocaleString()} ft</p>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([flight.currentLng, flight.currentLat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [inAirFlights, onFlightSelect]);

  // Fly to selected flight or airport
  useEffect(() => {
    if (!map.current) return;

    if (selectedFlight && selectedFlight.status === 'In Air') {
      map.current.flyTo({
        center: [selectedFlight.currentLng, selectedFlight.currentLat],
        zoom: 7,
        duration: 1500
      });
    } else if (selectedAirportCode) {
      const airport = getAirportByCode(selectedAirportCode);
      if (airport) {
        map.current.flyTo({
          center: [airport.lng, airport.lat],
          zoom: 10,
          duration: 1500
        });
      }
    }
  }, [selectedFlight, selectedAirportCode]);

  // Draw flight path for selected flight
  useEffect(() => {
    if (!map.current) return;

    const sourceId = 'flight-path';
    const layerId = 'flight-path-line';
    const dashedLayerId = 'flight-path-dashed';

    // Remove existing layers and source
    if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
    if (map.current.getLayer(dashedLayerId)) map.current.removeLayer(dashedLayerId);
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

    if (!selectedFlight) return;

    const origin = getAirportByCode(selectedFlight.origin);
    const destination = getAirportByCode(selectedFlight.destination);
    if (!origin || !destination) return;

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { type: 'traveled' },
            geometry: {
              type: 'LineString',
              coordinates: [
                [origin.lng, origin.lat],
                [selectedFlight.currentLng, selectedFlight.currentLat]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { type: 'remaining' },
            geometry: {
              type: 'LineString',
              coordinates: [
                [selectedFlight.currentLng, selectedFlight.currentLat],
                [destination.lng, destination.lat]
              ]
            }
          }
        ]
      }
    });

    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      filter: ['==', ['get', 'type'], 'traveled'],
      paint: {
        'line-color': '#3b82f6',
        'line-width': 3,
        'line-opacity': 0.8
      }
    });

    map.current.addLayer({
      id: dashedLayerId,
      type: 'line',
      source: sourceId,
      filter: ['==', ['get', 'type'], 'remaining'],
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-opacity': 0.4,
        'line-dasharray': [4, 4]
      }
    });
  }, [selectedFlight]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
