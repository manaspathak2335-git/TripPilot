import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Star, Clock, MapPin, Utensils, Coffee, ShoppingBag, Wifi, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAmenitiesByAirport, Amenity } from '@/data/amenities';
import { Airport } from '@/data/airports';
import { cn } from '@/lib/utils';

interface AirportAmenitiesPanelProps {
  airportCode: string | null;
  onClose: () => void;
}

export const AirportAmenitiesPanel = ({ airportCode, onClose }: AirportAmenitiesPanelProps) => {
  const [airport, setAirport] = useState<Airport | null>(null);

  useEffect(() => {
    if (!airportCode) {
      setAirport(null);
      return;
    }

    // Fetch airport from API
    const fetchAirport = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/airports');
        const data = await response.json();
        if (data.airports) {
          const found = data.airports.find((ap: any) => ap.code === airportCode);
          if (found) {
            setAirport({
              code: found.code || '',
              name: found.name || 'Unknown Airport',
              city: found.city || 'Unknown City',
              lat: found.lat || 0,
              lng: found.lng || 0,
              terminal: found.terminal || 1,
              amenities: {
                restaurants: found.amenities?.restaurants || 0,
                lounges: found.amenities?.lounges || 0,
                shops: found.amenities?.shops || 0,
                services: found.amenities?.services || 0
              }
            });
          } else {
            setAirport(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch airport:", error);
        setAirport(null);
      }
    };

    fetchAirport();
  }, [airportCode]);

  if (!airportCode || !airport) return null;

  const amenities = getAmenitiesByAirport(airportCode);

  const getTypeIcon = (type: Amenity['type']) => {
    switch (type) {
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      case 'lounge': return <Coffee className="w-4 h-4" />;
      case 'shop': return <ShoppingBag className="w-4 h-4" />;
      case 'service': return <Wifi className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Amenity['type']) => {
    switch (type) {
      case 'restaurant': return 'text-warning bg-warning/10 border-warning/30';
      case 'lounge': return 'text-accent bg-accent/10 border-accent/30';
      case 'shop': return 'text-success bg-success/10 border-success/30';
      case 'service': return 'text-primary bg-primary/10 border-primary/30';
    }
  };

  const groupedAmenities = {
    restaurant: amenities.filter(a => a.type === 'restaurant'),
    lounge: amenities.filter(a => a.type === 'lounge'),
    shop: amenities.filter(a => a.type === 'shop'),
    service: amenities.filter(a => a.type === 'service'),
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
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold">{airport.code}</span>
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                Terminal {airport.terminal}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{airport.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{airport.amenities.restaurants}</p>
            <p className="text-xs text-muted-foreground">Food</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{airport.amenities.lounges}</p>
            <p className="text-xs text-muted-foreground">Lounges</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{airport.amenities.shops}</p>
            <p className="text-xs text-muted-foreground">Shops</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold">{airport.amenities.services}</p>
            <p className="text-xs text-muted-foreground">Services</p>
          </div>
        </div>
      </div>

      {/* Amenities List */}
      <div className="p-4 space-y-6">
        {Object.entries(groupedAmenities).map(([type, items]) => {
          if (items.length === 0) return null;
          
          const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + 's';
          
          return (
            <div key={type}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                {getTypeIcon(type as Amenity['type'])}
                {typeLabel}
              </h3>
              <div className="space-y-2">
                {items.map((amenity) => (
                  <motion.div
                    key={amenity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border text-xl",
                        getTypeColor(amenity.type)
                      )}>
                        {amenity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{amenity.name}</h4>
                          <div className="flex items-center gap-1 text-warning">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs">{amenity.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{amenity.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {amenity.terminal}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {amenity.hours}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
