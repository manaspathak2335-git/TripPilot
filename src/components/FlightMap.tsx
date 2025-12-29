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

  // State for Live API Data
  const [liveFlights, setLiveFlights] = useState<Flight[]>([]);
  const [apiAirports, setApiAirports] = useState<Airport[]>([]);

  // 1. Fetch Airports from AviationStack API
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/airports');
        const data = await response.json();
        
        if (data.airports && data.airports.length > 0) {
          // Transform API data to Airport format
          const transformedAirports: Airport[] = data.airports.map((ap: any) => ({
            code: ap.code || '',
            name: ap.name || 'Unknown Airport',
            city: ap.city || 'Unknown City',
            lat: ap.lat || 0,
            lng: ap.lng || 0,
            terminal: 1, // Default, API doesn't provide this
            amenities: {
              restaurants: 0,
              lounges: 0,
              shops: 0,
              services: 0
            }
          }));
          setApiAirports(transformedAirports);
        }
      } catch (error) {
        console.error("Failed to fetch airports:", error);
        // Fallback to static airports if API fails
        setApiAirports([]);
      }
    };

    fetchAirports();
    // Refresh airports every 5 minutes (they don't change often)
    const interval = setInterval(fetchAirports, 300000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Real Data from Python Backend (only if showFlights is true)
  useEffect(() => {
    if (!showFlights) {
      setLiveFlights([]);
      return;
    }

    const fetchLiveFlights = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/flights/active');
        const data = await response.json();
        
        // Transform Backend Data to Frontend 'Flight' Structure
        const mappedFlights: Flight[] = data.flights.map((f: any) => ({
          id: f.icao24,
          flightNumber: f.callsign || 'N/A',
          airline: f.callsign ? f.callsign.substring(0, 3) : "Unknown",
          origin: "Unknown", 
          destination: "Unknown",
          scheduledDeparture: "Now",
          scheduledArrival: "TBD",
          duration: "N/A",
          status: "In Air",
          price: 0,
          currentLat: f.lat,
          currentLng: f.lon,
          altitude: f.altitude || 30000,
          heading: f.heading || 0,
          speed: f.velocity ? Math.round(f.velocity * 3.6) : 800 // m/s to km/h
        }));
        
        setLiveFlights(mappedFlights);
      } catch (error) {
        console.error("Failed to fetch live flights:", error);
      }
    };

    fetchLiveFlights();
    const interval = setInterval(fetchLiveFlights, 15000); // Poll every 15s
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
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // 4. Update Markers (Airports + Flights)
  useEffect(() => {
    if (!map.current) return;

    // Cleanup old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    airportMarkersRef.current.forEach(m => m.remove());
    airportMarkersRef.current = [];

    // Use API airports if available, otherwise fallback to static airports
    const airportsToDisplay = apiAirports.length > 0 ? apiAirports : airports;

    // Add Airport Markers - Make them more prominent when flights are hidden
    airportsToDisplay.forEach((airport) => {
      const weather = getWeatherByAirport(airport.code);
      const severity = weather?.severity || 'green';
      const borderColor = getSeverityColor(severity);
      const isSelected = selectedAirportCode === airport.code;
      const size = showFlights ? 28 : (isSelected ? 40 : 36);
      const borderWidth = showFlights ? 3 : (isSelected ? 4 : 3);

      const el = document.createElement('div');
      el.className = 'airport-marker';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="width:${size}px;height:${size}px;background:#1e293b;border:${borderWidth}px solid ${borderColor};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);transition:all 0.2s;">
          <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;

      el.addEventListener('click', () => {
        // Trigger airport selection if there's a handler
        if (onAirportSelect) {
          onAirportSelect(airport);
        }
      });

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="padding:8px;background:#0f172a;color:white;border-radius:8px;font-family:system-ui;">
          <strong style="font-size:14px;">${airport.code}</strong>
          <p style="margin:4px 0 0;font-size:12px;">${airport.name}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">${airport.city}</p>
        </div>
      `);
      
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([airport.lng, airport.lat])
        .setPopup(popup)
        .addTo(map.current!);
      airportMarkersRef.current.push(marker);
    });

    // Add LIVE Flight Markers (only if showFlights is true)
    if (showFlights) {
      liveFlights.forEach((flight) => {
      const color = getStatusColor(flight.status);
      const rotation = (flight.heading || 0) - 90; 

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
          <p style="margin:4px 0 0;font-size:12px;">Alt: ${flight.altitude}ft</p>
          <p style="margin:2px 0 0;font-size:11px;color:#94a3b8;">Speed: ${flight.speed} km/h</p>
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