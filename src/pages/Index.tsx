import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { WeatherWidget } from '@/components/WeatherWidget';
import { AIChatbot } from '@/components/AIChatbot';
import { FlightListWidget } from '@/components/FlightListWidget';
import { FlightMap } from '@/components/FlightMap';
import { FlightInfoPanel } from '@/components/FlightInfoPanel';
import { Flight } from '@/data/flights';
import { Airport } from '@/data/airports';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Clock, Gauge, Navigation } from 'lucide-react';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedAirportCode, setSelectedAirportCode] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setSelectedAirportCode(null);
  };

  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirportCode(airport.code);
    setSelectedFlight(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

      {/* Interactive Map */}
      <div className="fixed inset-0 pt-14">
        <FlightMap
          selectedFlight={selectedFlight}
          onFlightSelect={handleFlightSelect}
          selectedAirportCode={selectedAirportCode}
        />
      </div>

      {/* Top Status Bar */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-20">
        <div className="glass-strong rounded-full px-6 py-2 flex items-center gap-6 border border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-mono font-semibold">{formatTime(currentTime)} IST</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <Plane className="w-4 h-4 text-primary" />
            <span className="font-mono">15 Active Flights</span>
          </div>
        </div>
      </div>

      {/* Left Panel - Search & Flights */}
      <div className="fixed top-24 left-4 z-20 flex flex-col gap-3 max-w-xs w-80">
        <SearchBar onFlightSelect={handleFlightSelect} onAirportSelect={handleAirportSelect} />
        <FlightListWidget onFlightSelect={handleFlightSelect} selectedFlightId={selectedFlight?.id || null} />
        <WeatherWidget />
      </div>

      {/* Right Panel - Selected Flight Info */}
      <AnimatePresence>
        {selectedFlight && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-24 right-4 z-20 w-80"
          >
            <div className="glass-strong rounded-xl border border-primary/30 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-mono text-xl font-bold text-primary">{selectedFlight.flightNumber}</h3>
                      <p className="text-muted-foreground text-xs">{selectedFlight.airline}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedFlight(null)}
                    className="w-8 h-8 rounded-lg bg-background/50 hover:bg-background flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Route */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="font-mono text-2xl font-bold">{selectedFlight.origin}</div>
                    <div className="text-xs text-muted-foreground mt-1">{selectedFlight.departureTime}</div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="relative h-0.5 bg-gradient-to-r from-primary via-primary/50 to-muted">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                      <motion.div 
                        className="absolute top-1/2 -translate-y-1/2"
                        style={{ left: '50%' }}
                        animate={{ left: ['30%', '70%', '30%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Plane className="w-4 h-4 text-primary -rotate-0" />
                      </motion.div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-muted rounded-full" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-2xl font-bold">{selectedFlight.destination}</div>
                    <div className="text-xs text-muted-foreground mt-1">{selectedFlight.arrivalTime}</div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="px-4 py-3 border-b border-border/50">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  selectedFlight.status === 'In Air' ? 'bg-blue-500/20 text-blue-400' :
                  selectedFlight.status === 'On Time' ? 'bg-green-500/20 text-green-400' :
                  selectedFlight.status === 'Delayed' ? 'bg-amber-500/20 text-amber-400' :
                  selectedFlight.status === 'Boarding' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                  </span>
                  {selectedFlight.status}
                </div>
              </div>

              {/* Live Data */}
              {selectedFlight.status === 'In Air' && (
                <div className="p-4 grid grid-cols-3 gap-3">
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Navigation className="w-3 h-3" />
                      <span className="text-[10px] uppercase">Altitude</span>
                    </div>
                    <div className="font-mono text-lg font-bold">{selectedFlight.altitude.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">feet</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Gauge className="w-3 h-3" />
                      <span className="text-[10px] uppercase">Speed</span>
                    </div>
                    <div className="font-mono text-lg font-bold">{selectedFlight.speed}</div>
                    <div className="text-[10px] text-muted-foreground">knots</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Navigation className="w-3 h-3 rotate-45" />
                      <span className="text-[10px] uppercase">Heading</span>
                    </div>
                    <div className="font-mono text-lg font-bold">{selectedFlight.heading}°</div>
                    <div className="text-[10px] text-muted-foreground">degrees</div>
                  </div>
                </div>
              )}

              {/* Gate Info */}
              {(selectedFlight.gate || selectedFlight.terminal) && (
                <div className="px-4 pb-4">
                  <div className="bg-background/50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground">Terminal</div>
                      <div className="font-mono font-bold">{selectedFlight.terminal || '-'}</div>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground">Gate</div>
                      <div className="font-mono font-bold">{selectedFlight.gate || '-'}</div>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground">Aircraft</div>
                      <div className="font-mono font-bold">{selectedFlight.aircraft}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIChatbot />
    </div>
  );
};

export default Index;