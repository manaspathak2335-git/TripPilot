import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { flights, Flight } from '@/data/flights';
import { airports, getAirportByCode } from '@/data/airports';
import { getWeatherByAirport } from '@/data/weather';

interface MapInnerProps {
  selectedFlight: Flight | null;
  onFlightSelect: (flight: Flight) => void;
  selectedAirportCode: string | null;
  createFlightIcon: (status: string, heading: number) => L.DivIcon;
  createAirportIcon: (severity: string) => L.DivIcon;
}

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

export default function MapInner({ selectedFlight, onFlightSelect, selectedAirportCode, createFlightIcon, createAirportIcon }: MapInnerProps) {
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
              <div className="text-sm p-1">
                <strong className="text-base">{airport.code}</strong>
                <p className="text-gray-600">{airport.city}</p>
                {weather && (
                  <p className="mt-1">{weather.icon} {weather.temperature}°C - {weather.condition}</p>
                )}
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
            <div className="text-sm p-1">
              <strong className="text-base">{flight.flightNumber}</strong>
              <p className="text-gray-600">{flight.airline}</p>
              <p>{flight.origin} → {flight.destination}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {selectedFlight && flightPath && (
        <>
          <Polyline 
            positions={[flightPath[0], flightPath[1]]} 
            pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.8 }} 
          />
          <Polyline 
            positions={[flightPath[1], flightPath[2]]} 
            pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.4, dashArray: '8, 8' }} 
          />
        </>
      )}
    </MapContainer>
  );
}
