import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { WeatherWidget } from '@/components/WeatherWidget';
import { AIChatbot } from '@/components/AIChatbot';
import { FlightListWidget } from '@/components/FlightListWidget';
import { FlightMap } from '@/components/FlightMap';
import { FlightInfoPanel } from '@/components/FlightInfoPanel';
import { Flight, flights } from '@/data/flights';
import { Airport } from '@/data/airports';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Clock, Gauge, Navigation, Home, Map, List, Settings } from 'lucide-react';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWeatherAlertsOpen, setIsWeatherAlertsOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedAirportCode, setSelectedAirportCode] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const params = new URLSearchParams(location.search);
  const openChat = params.get('openChat') === '1' || params.get('openChat') === 'true';

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFlightSelect = async (flight: Flight) => {
    setSelectedAirportCode(null);

    // Local mock pairs in case backend is unreachable
    const mockPairs: [string, string][] = [
      ["Indira Gandhi International Airport, Delhi", "Chhatrapati Shivaji Maharaj International, Mumbai"],
      ["Kempegowda International Airport, Bangalore", "Chennai International Airport"],
      ["Netaji Subhas Chandra Bose Intl, Kolkata", "Rajiv Gandhi International Airport, Hyderabad"],
    ];

    try {
      const res = await fetch('http://localhost:8000/api/track-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icao24: flight.id })
      });

      if (res.ok) {
        const data = await res.json();
        const origin = data.flight_info?.origin || flight.origin || mockPairs[Math.floor(Math.random()*mockPairs.length)][0];
        const destination = data.flight_info?.destination || flight.destination || mockPairs[Math.floor(Math.random()*mockPairs.length)][1];
        setSelectedFlight({ ...flight, origin, destination, raw_route: data.raw_route });
        return;
      }
    } catch (e) {
      console.error('Failed to fetch route from backend, using mock:', e);
    }

    // Fallback to existing flight values or a random mock pair
    const pair = mockPairs[Math.floor(Math.random()*mockPairs.length)];
    setSelectedFlight({ ...flight, origin: flight.origin !== 'Unknown' ? flight.origin : pair[0], destination: flight.destination !== 'Unknown' ? flight.destination : pair[1] });
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

  // Extract a probable city from an airport string like "Airport Name, City"
  const parseCityFromName = (name: string | undefined) => {
    if (!name) return 'Unknown';
    const parts = name.split(',');
    if (parts.length > 1) return parts[parts.length - 1].trim();
    // fallback heuristics
    const words = name.split(' ');
    return words.length > 0 ? words[words.length - 1] : name;
  };

  const getMockWeatherForCity = (city: string) => {
    const c = (city || '').toLowerCase();
    if (c.includes('delhi')) return { icon: '☀️', condition: 'Sunny', temperature: 28, severity: 'green' };
    if (c.includes('mumbai')) return { icon: '⛅', condition: 'Partly Cloudy', temperature: 30, severity: 'yellow' };
    if (c.includes('bangalore') || c.includes('bengaluru')) return { icon: '🌧️', condition: 'Showers', temperature: 22, severity: 'yellow' };
    if (c.includes('chennai')) return { icon: '☁️', condition: 'Humid', temperature: 33, severity: 'yellow' };
    if (c.includes('hyderabad')) return { icon: '⛅', condition: 'Cloudy', temperature: 31, severity: 'yellow' };
    if (c.includes('kolkata')) return { icon: '⛈️', condition: 'Thunderstorms', temperature: 29, severity: 'red' };
    return { icon: '☀️', condition: 'Clear', temperature: 25, severity: 'green' };
  };

  const [liveFlightsCount, setLiveFlightsCount] = useState<number>(
    flights.filter(f => f.status === 'In Air').length
  );

  useEffect(() => {
    let mounted = true;

    const fetchLiveCount = async () => {
      try {
        // Use backend API instead of calling OpenSky directly (avoids CORS issues)
        const res = await fetch('http://localhost:8000/api/flights/active');
        if (!res.ok) throw new Error('Network response not ok');
        const data = await res.json();
        const activeFlights = data.flights || [];
        // Count all flights returned from backend (already filtered for India region)
        if (mounted) setLiveFlightsCount(activeFlights.length);
      } catch (err) {
        console.error('Failed to fetch live flight count:', err);
        // fallback to local static data already set
        if (mounted) setLiveFlightsCount(flights.filter(f => f.status === 'In Air').length);
      }
    };

    fetchLiveCount();
    const id = setInterval(fetchLiveCount, 15000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} 
        isMenuOpen={isMenuOpen}
        onNotificationClick={() => setIsWeatherAlertsOpen(!isWeatherAlertsOpen)}
      />

      {/* Interactive Map */}
      <div className="fixed inset-0 pt-14">
        <FlightMap
          selectedFlight={selectedFlight}
          onFlightSelect={handleFlightSelect}
          selectedAirportCode={selectedAirportCode}
          onAirportSelect={handleAirportSelect}
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
            <span className="font-mono">{liveFlightsCount} Active Flight{liveFlightsCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      {/* Left Sidebar Nav (hidden when not authenticated) */}
      {isAuthenticated && (
        <nav className="fixed top-24 left-4 z-30 w-12">
          <div className="glass-strong rounded-xl p-2 flex flex-col items-center gap-2 border border-border/50">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-muted/20" aria-label="Home" title="Home">
              <Home className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/plan-trip')} className="p-2 rounded-lg hover:bg-muted/20" aria-label="Plan a trip" title="Plan a trip">
              <Map className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/itinerary')} className="p-2 rounded-lg hover:bg-muted/20" aria-label="My itineraries" title="My itineraries">
              <List className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/search-history')} className="p-2 rounded-lg hover:bg-muted/20" aria-label="Search history" title="Search history">
              <Clock className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/settings')} className="p-2 rounded-lg hover:bg-muted/20" aria-label="Settings" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </nav>
      )}

      {/* Left Panel - Search & Flights */}
      <div className="fixed top-24 left-20 z-20 flex flex-col gap-3 max-w-xs w-80">
        <SearchBar onFlightSelect={handleFlightSelect} onAirportSelect={handleAirportSelect} />
        <FlightListWidget onFlightSelect={handleFlightSelect} selectedFlightId={selectedFlight?.id || null} />
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
                    <div className="font-mono text-sm font-bold max-w-[11rem]">{selectedFlight.origin}</div>
                    <div className="text-xs text-muted-foreground mt-1">{selectedFlight.departureTime}</div>
                    {/* Mock weather for origin city */}
                    {(() => {
                      const city = parseCityFromName(selectedFlight.origin);
                      const w = getMockWeatherForCity(city);
                      return (
                        <div className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-2">
                          <span className="text-sm">{w.icon}</span>
                          <span>{w.condition} · {w.temperature}°C</span>
                        </div>
                      );
                    })()}
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
                    <div className="font-mono text-sm font-bold max-w-[11rem]">{selectedFlight.destination}</div>
                    <div className="text-xs text-muted-foreground mt-1">{selectedFlight.arrivalTime}</div>
                    {/* Mock weather for destination city */}
                    {(() => {
                      const city = parseCityFromName(selectedFlight.destination);
                      const w = getMockWeatherForCity(city);
                      return (
                        <div className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-2">
                          <span className="text-sm">{w.icon}</span>
                          <span>{w.condition} · {w.temperature}°C</span>
                        </div>
                      );
                    })()}
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

      <AIChatbot selectedContext={selectedFlight} initialOpen={openChat} />

      {/* Weather Alerts Dropdown */}
      <AnimatePresence>
        {isWeatherAlertsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWeatherAlertsOpen(false)}
              className="fixed inset-0 z-40 bg-background/20 backdrop-blur-sm"
            />
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-16 right-4 z-50 w-80"
            >
              <WeatherWidget onClose={() => setIsWeatherAlertsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;