import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { WeatherWidget } from '@/components/WeatherWidget';
import { AirportListWidget } from '@/components/AirportListWidget';
import { FlightMap } from '@/components/FlightMap';
import { AirportAmenitiesPanel } from '@/components/AirportAmenitiesPanel';
import { Airport } from '@/data/airports';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Home, Map, List, Settings, MapPin } from 'lucide-react';

const AirportPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWeatherAlertsOpen, setIsWeatherAlertsOpen] = useState(false);
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

  const handleAirportSelect = (airport: Airport) => {
    console.log('Airport selected in AirportPage:', airport);
    setSelectedAirportCode(airport.code);
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

  const [airportsCount, setAirportsCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    const fetchAirportsCount = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/airports');
        if (!res.ok) throw new Error('Network response not ok');
        const data = await res.json();
        const airports = data.airports || [];
        if (mounted) setAirportsCount(airports.length);
      } catch (err) {
        console.error('Failed to fetch airports count:', err);
        if (mounted) setAirportsCount(0);
      }
    };

    fetchAirportsCount();
    // Refresh every 5 minutes
    const id = setInterval(fetchAirportsCount, 300000);
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
          selectedFlight={null}
          onFlightSelect={() => {}}
          selectedAirportCode={selectedAirportCode}
          onAirportSelect={handleAirportSelect}
          showFlights={false}
          showAirports={true}
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
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-mono">{airportsCount} Airport{airportsCount === 1 ? '' : 's'}</span>
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

      {/* Left Panel - Search & Airports */}
      <div className="fixed top-24 left-20 z-20 flex flex-col gap-3 max-w-xs w-80">
        <SearchBar onFlightSelect={() => {}} onAirportSelect={handleAirportSelect} />
        <AirportListWidget onAirportSelect={handleAirportSelect} selectedAirportCode={selectedAirportCode} />
      </div>

      {/* Right Panel - Selected Airport Info */}
      <AirportAmenitiesPanel 
        airportCode={selectedAirportCode}
        onClose={() => setSelectedAirportCode(null)}
      />

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
              className="fixed top-16 right-4 z-50 w-[500px] max-h-[calc(100vh-5rem)]"
            >
              <WeatherWidget onClose={() => setIsWeatherAlertsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AirportPage;

