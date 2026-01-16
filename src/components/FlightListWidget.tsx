import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import API_URL from '@/config';
import { Flight } from '@/data/flights';

interface FlightListWidgetProps {
  onFlightSelect: (flight: Flight) => void;
  selectedFlightId: string | null;
}

export const FlightListWidget = ({ onFlightSelect, selectedFlightId }: FlightListWidgetProps) => {
  const [realFlights, setRealFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFlights = async () => {
    try {
      const response = await fetch(`${API_URL}/api/flights/active`);
      const data = await response.json();
      
      if (data.flights) {
        setRealFlights(data.flights);
        setTotalCount(data.flights.length);
      }
    } catch (error) {
      console.error("Failed to fetch flight list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sort logic is handled by backend now, we just slice the top 20
  const displayedFlights = realFlights.slice(0, 20);

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'On Time': return 'bg-success';
      case 'Delayed': return 'bg-warning';
      case 'In Air': return 'bg-primary animate-pulse';
      case 'Boarding': return 'bg-accent';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-strong rounded-xl border border-border/50 overflow-hidden flex flex-col"
    >
      <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/20">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Plane className="w-4 h-4 text-primary" />
          Live Flights
        </h3>
        {/* MERGE FIX: Kept your Loading/Count indicator */}
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          <span className="text-xs text-muted-foreground font-mono">
            {totalCount} active
          </span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto custom-scrollbar relative">
        {displayedFlights.map((flight, index) => (
          <motion.button
            key={flight.id || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onFlightSelect(flight)}
            className={cn(
              "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-0",
              selectedFlightId === flight.id && "bg-primary/10 border-l-2 border-l-primary"
            )}
          >
            <div className="relative flex-shrink-0">
              <div className={cn("w-2 h-2 rounded-full", getStatusDot(flight.status))} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-sm">{flight.flightNumber}</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                  {flight.airline}
                </span>
              </div>
              
              {/* Conditional Route Display */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                {flight.origin && flight.destination ? (
                  <>
                    <span className="font-medium text-foreground/80">{flight.origin}</span>
                    <span className="text-muted-foreground/50">→</span>
                    <span className="font-medium text-foreground/80">{flight.destination}</span>
                  </>
                ) : (
                  <span className="text-[10px] italic opacity-50">Route info unavailable</span>
                )}
              </div>
            </div>

            <div className="text-right flex-shrink-0 min-w-[60px]">
              <p className="text-xs font-medium font-mono">
                {typeof flight.altitude === 'number' ? flight.altitude.toLocaleString() : '0'} <span className="text-[9px] text-muted-foreground">ft</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {flight.speed} <span className="text-[9px]">kts</span>
              </p>
            </div>
          </motion.button>
        ))}

        {!loading && displayedFlights.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No active flights found.
          </div>
        )}
      </div>
      
      <div className="p-2 bg-muted/10 border-t border-border/50 text-center">
        <p className="text-[10px] text-muted-foreground">
          Sorted by Priority Airline & Altitude
        </p>
      </div>
    </motion.div>
  );
};