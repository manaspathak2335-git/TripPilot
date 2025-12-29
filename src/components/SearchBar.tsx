import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plane, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Flight } from '@/data/flights';
import { Airport } from '@/data/airports';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onFlightSelect: (flight: Flight) => void;
  onAirportSelect: (airport: Airport) => void;
}

export const SearchBar = ({ onFlightSelect, onAirportSelect }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [apiAirports, setApiAirports] = useState<Airport[]>([]);
  const [results, setResults] = useState<{ flights: Flight[]; airports: Airport[] }>({
    flights: [],
    airports: []
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch airports from API
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/airports');
        const data = await response.json();
        if (data.airports && data.airports.length > 0) {
          const transformedAirports: Airport[] = data.airports.map((ap: any) => ({
            code: ap.code || '',
            name: ap.name || 'Unknown Airport',
            city: ap.city || 'Unknown City',
            lat: ap.lat || 0,
            lng: ap.lng || 0,
            terminal: 1,
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
      }
    };

    fetchAirports();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const matchedFlights = api.searchFlight(query).then((arr) => arr.slice(0, 5)).catch(() => []);
      // update results asynchronously
      (async () => {
        const flightsArr = await api.searchFlight(query).catch(() => []);
        const q = query.toLowerCase();
        const matchedAirports = apiAirports.filter(
          a => a.code.toLowerCase().includes(q) || 
               a.city.toLowerCase().includes(q) ||
               a.name.toLowerCase().includes(q)
        ).slice(0, 5);
        setResults({ flights: flightsArr.slice(0,5), airports: matchedAirports });
        setIsOpen(true);
      })();
    } else {
      setResults({ flights: [], airports: [] });
      setIsOpen(false);
    }
  }, [query, apiAirports]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFlightClick = (flight: Flight) => {
    onFlightSelect(flight);
    setQuery('');
    setIsOpen(false);
  };

  const saveSearch = async (queryStr: string, flight?: Flight) => {
    try {
      const mod = await import('@/lib/storage');
      // try firebase first
      try {
        const fb = await import('@/lib/firebase');
        const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
        const user = fb.auth?.currentUser;
        if (user) {
          await addDoc(collection(fb.db, 'users', user.uid, 'searches'), {
            query: queryStr,
            flightId: flight?.id || null,
            createdAt: serverTimestamp(),
          });
          return;
        }
      } catch (e) {
        // ignore and fallback to local
      }

      mod.saveQueryLocal(queryStr);
    } catch (err) {
      console.warn('Failed to persist search', err);
    }
  };

  const performSearch = async (q: string) => {
    const found = await api.getFlightByCodeOrNumber(q).catch(() => null);
    if (found) {
      onFlightSelect(found);
      await saveSearch(q, found);
      setQuery('');
      setIsOpen(false);
    } else {
      // if nothing found, keep suggestions open (handled by results)
    }
  };

  const handleAirportClick = (airport: Airport) => {
    onAirportSelect(airport);
    setQuery('');
    setIsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return 'text-success';
      case 'Delayed': return 'text-warning';
      case 'In Air': return 'text-primary';
      case 'Landed': return 'text-muted-foreground';
      case 'Boarding': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search flights, airports, cities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter' && query.trim()) {
              e.preventDefault();
              await performSearch(query.trim());
            }
          }}
          className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (results.flights.length > 0 || results.airports.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-lg border border-border/50 shadow-elevated overflow-hidden z-50"
          >
            {/* Flights */}
            {results.flights.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 py-1 uppercase tracking-wider">Flights</p>
                {results.flights.map((flight) => (
                  <button
                    key={flight.id}
                    onClick={() => handleFlightClick(flight)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Plane className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm">{flight.flightNumber}</span>
                        <span className={cn("text-xs", getStatusColor(flight.status))}>{flight.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {flight.origin} → {flight.destination} • {flight.airline}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            {results.flights.length > 0 && results.airports.length > 0 && (
              <div className="border-t border-border/50" />
            )}

            {/* Airports */}
            {results.airports.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 py-1 uppercase tracking-wider">Airports</p>
                {results.airports.map((airport) => (
                  <button
                    key={airport.code}
                    onClick={() => handleAirportClick(airport)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm">{airport.code}</span>
                        <span className="text-xs text-muted-foreground">{airport.city}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{airport.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
