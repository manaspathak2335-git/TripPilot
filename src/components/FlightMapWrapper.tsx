import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { flights, Flight } from '@/data/flights';
import { airports, getAirportByCode } from '@/data/airports';
import { getWeatherByAirport } from '@/data/weather';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FlightMapWrapperProps {
  selectedFlight: Flight | null;
  onFlightSelect: (flight: Flight) => void;
  selectedAirportCode: string | null;
}

const createFlightIcon = (status: string, heading: number) => {
  const color = status === 'In Air' ? '#3b82f6' : status === 'Delayed' ? '#f59e0b' : status === 'On Time' ? '#22c55e' : status === 'Boarding' ? '#06b6d4' : '#6b7280';
  return L.divIcon({
    className: 'custom-flight-icon',
    html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;transform:rotate(${heading}deg)"><svg width="24" height="24" viewBox="0 0 24 24" fill="${color}"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createAirportIcon = (severity: string) => {
  const borderColor = severity === 'red' ? '#ef4444' : severity === 'yellow' ? '#f59e0b' : '#22c55e';
  return L.divIcon({
    className: 'custom-airport-icon',
    html: `<div style="width:24px;height:24px;background:#1e293b;border:2px solid ${borderColor};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function MapController({ selectedFlight, selectedAirportCode }: { selectedFlight: Flight | null; selectedAirportCode: string | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedFlight && selectedFlight.status === 'In Air') {
      map.flyTo([selectedFlight.currentLat, selectedFlight.currentLng], 7, { duration: 1 });
    } else if (selectedAirportCode) {
      const airport = getAirportByCode(selectedAirportCode);
      if (airport) {
        map.flyTo([airport.lat, airport.lng], 10, { duration: 1 });
      }
    }
  }, [selectedFlight, selectedAirportCode, map]);
  
  return null;
}

function FlightMapWrapper({ selectedFlight, onFlightSelect, selectedAirportCode }: FlightMapWrapperProps) {
  const inAirFlights = useMemo(() => flights.filter(f => f.status === 'In Air'), []);

  const flightPath = useMemo(() => {
    if (!selectedFlight) return null;
    const origin = getAirportByCode(selectedFlight.origin);
    const destination = getAirportByCode(selectedFlight.destination);
    if (!origin || !destination) return null;
    return [
      [origin.lat, origin.lng] as [number, number],
      [selectedFlight.currentLat, selectedFlight.currentLng] as [number, number],
      [destination.lat, destination.lng] as [number, number],
    ];
  }, [selectedFlight]);

  return (
    <MapContainer 
      center={[20.5937, 78.9629]} 
      zoom={5} 
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController selectedFlight={selectedFlight} selectedAirportCode={selectedAirportCode} />

      {airports.map((airport) => {
        const weather = getWeatherByAirport(airport.code);
        const severity = weather?.severity || 'green';
        return (
          <Marker 
            key={airport.code} 
            position={[airport.lat, airport.lng]} 
            icon={createAirportIcon(severity)}
          >
            <Popup>
              <div className="p-2">
                <strong>{airport.code}</strong> - {airport.city}
                {weather && <p>{weather.icon} {weather.temperature}°C</p>}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {inAirFlights.map((flight) => (
        <Marker 
          key={flight.id} 
          position={[flight.currentLat, flight.currentLng]} 
          icon={createFlightIcon(flight.status, flight.heading)} 
          eventHandlers={{ click: () => onFlightSelect(flight) }}
        >
          <Popup>
            <div className="p-2">
              <strong>{flight.flightNumber}</strong>
              <p>{flight.origin} → {flight.destination}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {selectedFlight && flightPath && (
        <>
          <Polyline positions={[flightPath[0], flightPath[1]]} pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.8 }} />
          <Polyline positions={[flightPath[1], flightPath[2]]} pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.4, dashArray: '8, 8' }} />
        </>
      )}
    </MapContainer>
  );
}

export default FlightMapWrapper;
