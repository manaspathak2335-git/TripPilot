import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Airport } from '@/data/airports';
import { getWeatherByAirport } from '@/data/weather';
import { cn } from '@/lib/utils';

interface AirportListWidgetProps {
  onAirportSelect: (airport: Airport) => void;
  selectedAirportCode: string | null;
}

export const AirportListWidget = ({ onAirportSelect, selectedAirportCode }: AirportListWidgetProps) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);

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
            terminal: ap.terminal || 1,
            amenities: {
              restaurants: ap.amenities?.restaurants || 0,
              lounges: ap.amenities?.lounges || 0,
              shops: ap.amenities?.shops || 0,
              services: ap.amenities?.services || 0
            }
          }));
          setAirports(transformedAirports);
        }
      } catch (error) {
        console.error("Failed to fetch airports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirports();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red': return 'border-destructive/50 bg-destructive/5';
      case 'yellow': return 'border-warning/50 bg-warning/5';
      default: return 'border-border/50';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-xl border border-border/50 overflow-hidden"
      >
        <div className="p-3 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Airports
          </h3>
        </div>
        <div className="p-4 text-center text-sm text-muted-foreground">
          Loading airports...
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-strong rounded-xl border border-border/50 overflow-hidden"
    >
      <div className="p-3 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Airports
        </h3>
        <span className="text-xs text-muted-foreground">{airports.length} total</span>
      </div>

      <div className="max-h-64 overflow-y-auto custom-scrollbar">
        {airports.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No airports found
          </div>
        ) : (
          airports.map((airport, index) => {
            const weather = getWeatherByAirport(airport.code);
            const severity = weather?.severity || 'green';
            
            return (
              <motion.button
                key={airport.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onAirportSelect(airport)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-0",
                  selectedAirportCode === airport.code && "bg-primary/10",
                  getSeverityColor(severity)
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm">{airport.code}</span>
                    {weather && (
                      <span className="text-lg" title={weather.condition}>
                        {weather.icon}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate">{airport.name}</p>
                  <p className="text-xs text-muted-foreground">{airport.city}</p>
                </div>
                {weather && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium">{weather.temperature}°C</p>
                    <p className="text-xs text-muted-foreground">{weather.condition}</p>
                  </div>
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

