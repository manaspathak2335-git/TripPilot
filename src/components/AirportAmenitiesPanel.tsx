import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Star, Clock, MapPin, Utensils, Coffee, ShoppingBag, Wifi, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAmenitiesByAirport, Amenity } from '@/data/amenities';
import { Airport } from '@/data/airports';
import { cn } from '@/lib/utils';

// Generate mock amenities for airports that don't have them
const generateMockAmenities = (airportCode: string, city: string): Amenity[] => {
  const terminal = 'T1';
  const restaurants = [
    { name: `${city} Bistro`, description: 'Multi-cuisine restaurant', icon: '🍽️', rating: 4.2 },
    { name: 'Coffee Corner', description: 'Fresh coffee and pastries', icon: '☕', rating: 4.0 },
    { name: 'Food Court', description: 'Quick service dining options', icon: '🍔', rating: 3.8 },
  ];
  
  const lounges = [
    { name: 'Premium Lounge', description: 'Relaxation area with snacks', icon: '🛋️', rating: 4.3 },
  ];
  
  const shops = [
    { name: 'Duty Free Shop', description: 'Perfumes, cosmetics, and spirits', icon: '🛍️', rating: 4.1 },
    { name: 'Bookstore', description: 'Books, magazines, and travel guides', icon: '📚', rating: 4.0 },
    { name: 'Souvenir Shop', description: 'Local handicrafts and gifts', icon: '🎁', rating: 3.9 },
  ];
  
  const services = [
    { name: 'ATM & Banking', description: '24-hour banking services', icon: '🏧', rating: 4.0 },
    { name: 'Medical Center', description: 'Emergency medical services', icon: '🏥', rating: 4.5 },
    { name: 'Prayer Room', description: 'Multi-faith prayer facility', icon: '🙏', rating: 4.8 },
    { name: 'Free WiFi', description: 'High-speed internet access', icon: '📶', rating: 4.2 },
  ];

  const mockAmenities: Amenity[] = [
    ...restaurants.map((r, i) => ({
      id: `${airportCode.toLowerCase()}-rest-${i + 1}`,
      name: r.name,
      type: 'restaurant' as const,
      airportCode,
      terminal,
      rating: r.rating,
      description: r.description,
      hours: '6AM - 11PM',
      icon: r.icon,
    })),
    ...lounges.map((l, i) => ({
      id: `${airportCode.toLowerCase()}-lounge-${i + 1}`,
      name: l.name,
      type: 'lounge' as const,
      airportCode,
      terminal,
      rating: l.rating,
      description: l.description,
      hours: '24/7',
      icon: l.icon,
    })),
    ...shops.map((s, i) => ({
      id: `${airportCode.toLowerCase()}-shop-${i + 1}`,
      name: s.name,
      type: 'shop' as const,
      airportCode,
      terminal,
      rating: s.rating,
      description: s.description,
      hours: '24/7',
      icon: s.icon,
    })),
    ...services.map((s, i) => ({
      id: `${airportCode.toLowerCase()}-service-${i + 1}`,
      name: s.name,
      type: 'service' as const,
      airportCode,
      terminal: 'All',
      rating: s.rating,
      description: s.description,
      hours: '24/7',
      icon: s.icon,
    })),
  ];

  return mockAmenities;
};

interface AirportAmenitiesPanelProps {
  airportCode: string | null;
  onClose: () => void;
}

export const AirportAmenitiesPanel = ({ airportCode, onClose }: AirportAmenitiesPanelProps) => {
  const [airport, setAirport] = useState<Airport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!airportCode) {
      setAirport(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Fetch airport from API
    const fetchAirport = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/airports');
        const data = await response.json();
        if (data.airports) {
          const found = data.airports.find((ap: any) => ap.code === airportCode);
          if (found) {
            // Check if we have existing amenities or need to generate mock ones
            const existingAmenities = getAmenitiesByAirport(airportCode);
            const hasExistingAmenities = existingAmenities.length > 0;
            
            // Calculate amenity counts (use existing if available, otherwise use mock counts)
            const mockAmenities = hasExistingAmenities ? [] : generateMockAmenities(
              found.code || airportCode, 
              found.city || 'Unknown City'
            );
            const totalAmenities = hasExistingAmenities ? existingAmenities : mockAmenities;
            
            const restaurantCount = totalAmenities.filter(a => a.type === 'restaurant').length;
            const loungeCount = totalAmenities.filter(a => a.type === 'lounge').length;
            const shopCount = totalAmenities.filter(a => a.type === 'shop').length;
            const serviceCount = totalAmenities.filter(a => a.type === 'service').length;
            
            setAirport({
              code: found.code || airportCode,
              name: found.name || `${airportCode} Airport`,
              city: found.city || 'Unknown City',
              lat: found.lat || 0,
              lng: found.lng || 0,
              terminal: found.terminal || 1,
              amenities: {
                restaurants: found.amenities?.restaurants || restaurantCount,
                lounges: found.amenities?.lounges || loungeCount,
                shops: found.amenities?.shops || shopCount,
                services: found.amenities?.services || serviceCount
              }
            });
          } else {
            // Airport not found in API, create a basic airport object with mock amenities
            const mockAmenities = generateMockAmenities(airportCode, airportCode);
            const restaurantCount = mockAmenities.filter(a => a.type === 'restaurant').length;
            const loungeCount = mockAmenities.filter(a => a.type === 'lounge').length;
            const shopCount = mockAmenities.filter(a => a.type === 'shop').length;
            const serviceCount = mockAmenities.filter(a => a.type === 'service').length;
            
            setAirport({
              code: airportCode,
              name: `${airportCode} Airport`,
              city: airportCode,
              lat: 0,
              lng: 0,
              terminal: 1,
              amenities: {
                restaurants: restaurantCount,
                lounges: loungeCount,
                shops: shopCount,
                services: serviceCount
              }
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch airport:", error);
        // On error, still create a basic airport object so panel can display
        const mockAmenities = generateMockAmenities(airportCode, airportCode);
        const restaurantCount = mockAmenities.filter(a => a.type === 'restaurant').length;
        const loungeCount = mockAmenities.filter(a => a.type === 'lounge').length;
        const shopCount = mockAmenities.filter(a => a.type === 'shop').length;
        const serviceCount = mockAmenities.filter(a => a.type === 'service').length;
        
        setAirport({
          code: airportCode,
          name: `${airportCode} Airport`,
          city: airportCode,
          lat: 0,
          lng: 0,
          terminal: 1,
          amenities: {
            restaurants: restaurantCount,
            lounges: loungeCount,
            shops: shopCount,
            services: serviceCount
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAirport();
  }, [airportCode]);

  if (!airportCode) return null;

  // Get existing amenities or generate mock ones if none exist
  const existingAmenities = getAmenitiesByAirport(airportCode);
  const amenities = useMemo(() => {
    if (!airport) return [];
    if (existingAmenities.length > 0) {
      return existingAmenities;
    }
    // Generate mock amenities for airports without data
    return generateMockAmenities(airportCode, airport.city);
  }, [airportCode, airport?.city, existingAmenities, airport]);

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
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold">{airportCode}</span>
                <span className="text-xs text-muted-foreground">Loading...</span>
              </div>
            ) : airport ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold">{airport.code}</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                    Terminal {airport.terminal}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{airport.name}</p>
              </>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        {airport && (
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
        )}
      </div>

      {/* Amenities List */}
      {!airport && isLoading && (
        <div className="p-4 text-center text-muted-foreground">
          Loading airport information...
        </div>
      )}
      {airport && (
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
      )}
    </motion.div>
  );
};
