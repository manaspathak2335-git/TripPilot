import { useState } from 'react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { WeatherWidget } from '@/components/WeatherWidget';
import { AIChatbot } from '@/components/AIChatbot';
import { FlightListWidget } from '@/components/FlightListWidget';
import { FlightMap } from '@/components/FlightMap';
import { Flight } from '@/data/flights';
import { Airport } from '@/data/airports';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedAirportCode, setSelectedAirportCode] = useState<string | null>(null);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setSelectedAirportCode(null);
  };

  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirportCode(airport.code);
    setSelectedFlight(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

      {/* Interactive Map */}
      <div className="fixed inset-0 pt-14">
        <FlightMap
          selectedFlight={selectedFlight}
          onFlightSelect={handleFlightSelect}
          selectedAirportCode={selectedAirportCode}
        />
      </div>

      {/* Floating UI */}
      <div className="fixed top-20 left-4 z-20 flex flex-col gap-4 max-w-xs">
        <SearchBar onFlightSelect={handleFlightSelect} onAirportSelect={handleAirportSelect} />
        <FlightListWidget onFlightSelect={handleFlightSelect} selectedFlightId={selectedFlight?.id || null} />
        <WeatherWidget />
      </div>

      {/* Selected flight info */}
      {selectedFlight && (
        <div className="fixed top-20 right-4 z-20 w-80 glass-strong rounded-xl border border-border/50 p-4">
          <h3 className="font-mono text-xl font-bold">{selectedFlight.flightNumber}</h3>
          <p className="text-muted-foreground text-sm">{selectedFlight.airline}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono">{selectedFlight.origin}</span>
            <span>→</span>
            <span className="font-mono">{selectedFlight.destination}</span>
          </div>
          <p className="mt-2 text-sm">Status: <span className="text-primary">{selectedFlight.status}</span></p>
          {selectedFlight.status === 'In Air' && (
            <div className="mt-2 text-xs text-muted-foreground">
              Alt: {selectedFlight.altitude.toLocaleString()} ft • Speed: {selectedFlight.speed} kts
            </div>
          )}
        </div>
      )}

      <AIChatbot />
    </div>
  );
};

export default Index;
