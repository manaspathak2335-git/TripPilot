import { motion } from 'framer-motion';
import { Plane, Clock, MapPin, Gauge, Compass, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Flight } from '@/data/flights';
import { getAirportByCode } from '@/data/airports';
import { getWeatherByAirport } from '@/data/weather';
import { cn } from '@/lib/utils';

interface FlightInfoPanelProps {
  flight: Flight | null;
  onClose: () => void;
}

export const FlightInfoPanel = ({ flight, onClose }: FlightInfoPanelProps) => {
  if (!flight) return null;

  const originAirport = getAirportByCode(flight.origin);
  const destAirport = getAirportByCode(flight.destination);
  const originWeather = getWeatherByAirport(flight.origin);
  const destWeather = getWeatherByAirport(flight.destination);

  const getStatusBadge = (status: string) => {
    const styles = {
      'On Time': 'status-ontime',
      'Delayed': 'status-delayed',
      'In Air': 'status-inair',
      'Boarding': 'bg-accent/20 text-accent border border-accent/30',
      'Landed': 'bg-muted text-muted-foreground border border-border',
    };
    return styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground';
  };

  // Helpers for mock city weather (fallback when real airport weather not available)
  const parseCityFromName = (name: string | undefined) => {
    if (!name) return 'Unknown';
    const parts = name.split(',');
    if (parts.length > 1) return parts[parts.length - 1].trim();
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

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-16 bottom-0 w-full sm:w-96 glass-strong border-l border-border/50 z-40 overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <div className="sticky top-0 glass-strong border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-sky flex items-center justify-center text-2xl">
              {flight.airlineLogo}
            </div>
            <div>
              <h2 className="font-mono text-xl font-bold">{flight.flightNumber}</h2>
              <p className="text-sm text-muted-foreground">{flight.airline}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className={cn("px-3 py-1 rounded-full text-xs font-medium", getStatusBadge(flight.status))}>
            {flight.status}
          </span>
          <span className="text-xs text-muted-foreground">{flight.aircraft}</span>
        </div>
      </div>

      {/* Route */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="font-mono text-2xl font-bold">{flight.origin}</p>
            <p className="text-xs text-muted-foreground">{originAirport?.city}</p>
            <p className="text-lg font-semibold mt-1">{flight.departureTime}</p>
            {(() => {
              const city = originAirport?.city || parseCityFromName(flight.origin);
              const w = getMockWeatherForCity(city);
              return (
                <div className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-2">
                  <span className="text-sm">{w.icon}</span>
                  <span>{w.condition} · {w.temperature}°C</span>
                </div>
              );
            })()}
            <p className="text-xs text-muted-foreground">{flight.gate}</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center px-4">
            <div className="w-full flex items-center">
              <div className="w-2 h-2 rounded-full bg-success" />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-success via-primary to-muted relative">
                {flight.status === 'In Air' && (
                  <motion.div
                    animate={{ left: `${flight.progress}%` }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  >
                    <Plane className="w-4 h-4 text-primary" style={{ transform: 'rotate(90deg)' }} />
                  </motion.div>
                )}
              </div>
              <div className="w-2 h-2 rounded-full bg-muted" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {flight.progress > 0 ? `${flight.progress}% complete` : 'Not departed'}
            </p>
          </div>

          <div className="text-center flex-1">
            <p className="font-mono text-sm font-bold max-w-[12rem]">{flight.destination}</p>
            <p className="text-xs text-muted-foreground">{destAirport?.city}</p>
            <p className="text-lg font-semibold mt-1">{flight.arrivalTime}</p>
            {(() => {
              const city = destAirport?.city || parseCityFromName(flight.destination);
              const w = getMockWeatherForCity(city);
              return (
                <div className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-2">
                  <span className="text-sm">{w.icon}</span>
                  <span>{w.condition} · {w.temperature}°C</span>
                </div>
              );
            })()}
            <p className="text-xs text-muted-foreground">{flight.terminal}</p>
          </div>
        </div>
      </div>

      {/* Live Data (for in-air flights) */}
      {flight.status === 'In Air' && (
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Live Flight Data</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Gauge className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{flight.altitude.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">feet</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <ArrowRight className="w-5 h-5 mx-auto text-accent mb-1" />
              <p className="text-lg font-bold">{flight.speed}</p>
              <p className="text-xs text-muted-foreground">knots</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <Compass className="w-5 h-5 mx-auto text-success mb-1" />
              <p className="text-lg font-bold">{flight.heading}°</p>
              <p className="text-xs text-muted-foreground">heading</p>
            </div>
          </div>
        </div>
      )}

      {/* Weather at Airports */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Weather Conditions</h3>
        
        <div className="space-y-3">
          {/* Origin Weather */}
          {originWeather && (
            <div className={cn(
              "p-3 rounded-lg border",
              originWeather.severity === 'red' ? 'bg-destructive/10 border-destructive/30' :
              originWeather.severity === 'yellow' ? 'bg-warning/10 border-warning/30' :
              'bg-muted/30 border-border/50'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{originWeather.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{flight.origin}</p>
                    <p className="text-xs text-muted-foreground">{originWeather.condition}</p>
                  </div>
                </div>
                <p className="text-lg font-bold">{originWeather.temperature}°C</p>
              </div>
              {originWeather.alert && (
                <p className="text-xs mt-2 text-warning">⚠️ {originWeather.alert}</p>
              )}
            </div>
          )}

          {/* Destination Weather */}
          {destWeather && (
            <div className={cn(
              "p-3 rounded-lg border",
              destWeather.severity === 'red' ? 'bg-destructive/10 border-destructive/30' :
              destWeather.severity === 'yellow' ? 'bg-warning/10 border-warning/30' :
              'bg-muted/30 border-border/50'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{destWeather.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{flight.destination}</p>
                    <p className="text-xs text-muted-foreground">{destWeather.condition}</p>
                  </div>
                </div>
                <p className="text-lg font-bold">{destWeather.temperature}°C</p>
              </div>
              {destWeather.alert && (
                <p className="text-xs mt-2 text-warning">⚠️ {destWeather.alert}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
