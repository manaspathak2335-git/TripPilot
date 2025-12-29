import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Flight } from '@/data/flights';
import { airports, Airport } from '@/data/airports';
import { getWeatherByAirport } from '@/data/weather';

interface FlightMapProps {
  selectedFlight: Flight | null;
  onFlightSelect: (flight: Flight) => void;
  selectedAirportCode: string | null;
  onAirportSelect?: (airport: Airport) => void;
  showFlights?: boolean;
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

export function FlightMap({ selectedFlight, onFlightSelect, selectedAirportCode, onAirportSelect, showFlights = true }: FlightMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const airportMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [liveFlights, setLiveFlights] = useState<Flight[]>([]);
  const [apiAirports, setApiAirports] = useState<Airport[]>([]);

  // 1. Fetch Airports (Teammate's Feature)
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/airports');
        const data = await response.json();
        if (data.airports && data.airports.length > 0) {
          setApiAirports(data.airports.map((ap: any) => ({
            code: ap.code || '',
            name: ap.name || 'Unknown Airport',
            city: ap.city || 'Unknown City',
            lat: ap.lat || 0,
            lng: ap.lng || 0,
            terminal: 1,
            amenities: { restaurants: 0, lounges: 0, shops: 0, services: 0 }
          })));
        }
      } catch (error) {
        console.error("Failed to fetch airports:", error);
        setApiAirports([]);
      }
    };
    fetchAirports();
  }, []);

  // 2. Fetch Live Flights (Your Feature)
  useEffect(() => {
    if (!showFlights) {
      setLiveFlights([]);
      return;
    }

    const fetchLiveFlights = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/flights/active');
        const data = await response.json();
        
        // Correct Mapping for FlightRadar Data
        const mappedFlights: Flight[] = data.flights.map((f: any) => ({
          id: f.id,
          flightNumber: f.flightNumber || 'Unknown',
          airline: f.airline || "Unknown",
          origin: f.origin || "Unknown", 
          destination: f.destination || "Unknown",
          scheduledDeparture: "Now",
          scheduledArrival: "TBD",
          duration: "N/A",
          status: "In Air",
          price: 0,
          currentLat: f.lat,
          currentLng: f.lon,
          altitude: f.altitude || 0,
          heading: f.heading || 0,
          speed: f.speed || 0 
        }));
        
        setLiveFlights(mappedFlights);
      } catch (error) {
        console.error("Failed to fetch live flights:", error);
      }
    };

    fetchLiveFlights();
    // This was the conflict line - we keep your comment/style
    const interval = setInterval(fetchLiveFlights, 15000); // Poll every 15s to match backend
    return () => clearInterval(interval);
  }, [showFlights]);

  // 3. Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
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
      center: [78.9629, 20.5937],
      zoom: 4.5,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // 4. Map Markers
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    airportMarkersRef.current.forEach(m => m.remove());
    airportMarkersRef.current = [];

    const airportsToDisplay = apiAirports.length > 0 ? apiAirports : airports;

    // Airport Markers
    airportsToDisplay.forEach((airport) => {
      const weather = getWeatherByAirport(airport.code);
      const severity = weather?.severity || 'green';
      const borderColor = getSeverityColor(severity);
      const isSelected = selectedAirportCode === airport.code;
      const size = showFlights ? 28 : (isSelected ? 40 : 36);

      const el = document.createElement('div');
      el.className = 'airport-marker';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="width:${size}px;height:${size}px;background:#1e293b;border:3px solid ${borderColor};border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;
      el.addEventListener('click', () => onAirportSelect && onAirportSelect(airport));

      new maplibregl.Marker({ element: el })
        .setLngLat([airport.lng, airport.lat])
        .addTo(map.current!);
    });

    // Flight Markers
    if (showFlights) {
      liveFlights.forEach((flight) => {
        const color = getStatusColor(flight.status);
        const rotation = (flight.heading || 0) - 90; 

        const el = document.createElement('div');
        el.className = 'flight-marker';
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;transform:rotate(${rotation}deg);">
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
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([flight.currentLng, flight.currentLat])
          .setPopup(popup)
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    }
  }, [liveFlights, onFlightSelect, onAirportSelect, showFlights, selectedAirportCode, apiAirports]); 

  return <div ref={mapContainer} className="w-full h-full" />;
}