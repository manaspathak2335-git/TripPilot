import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, MapPin, Calendar, Users, ArrowRight, 
  ArrowLeft, Sparkles, Clock, IndianRupee 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Airport } from '@/data/airports';

const popularDestinations = [
  { code: 'GOI', name: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400', price: '₹4,500' },
  { code: 'DEL', name: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', price: '₹3,200' },
  { code: 'BLR', name: 'Bangalore', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400', price: '₹3,800' },
  { code: 'CCU', name: 'Kolkata', image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=400', price: '₹4,100' },
];

export default function PlanTrip() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [tripData, setTripData] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    travelers: '1',
    tripType: 'roundtrip',
  });

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/airports');
        const data = await response.json();
        if (data.airports) {
          setAirports(data.airports);
        }
      } catch (error) {
        console.error('Failed to fetch airports:', error);
      }
    };

    fetchAirports();
  }, []);

  const handleSearch = () => {
    if (!tripData.from || !tripData.to || !tripData.departDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in origin, destination and departure date.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Searching flights...',
      description: `Finding the best flights from ${tripData.from} to ${tripData.to}`,
    });
    
    // Navigate to map with search params
    navigate(`/map?from=${tripData.from}&to=${tripData.to}`);
  };

  const handleDestinationClick = (code: string) => {
    setTripData(prev => ({ ...prev, to: code }));
    toast({
      title: 'Destination selected',
      description: `${code} has been set as your destination.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/map')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                <Plane className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Plan a Trip</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Where would you like to go?
          </h1>
          <p className="text-muted-foreground">
            Plan your perfect trip with AI-powered recommendations
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Flight Search</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trip Type */}
              <div className="flex gap-4">
                <Button
                  variant={tripData.tripType === 'roundtrip' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTripData(prev => ({ ...prev, tripType: 'roundtrip' }))}
                >
                  Round Trip
                </Button>
                <Button
                  variant={tripData.tripType === 'oneway' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTripData(prev => ({ ...prev, tripType: 'oneway' }))}
                >
                  One Way
                </Button>
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    From
                  </Label>
                  <Select 
                    value={tripData.from} 
                    onValueChange={(value) => setTripData(prev => ({ ...prev, from: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map(airport => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.city} ({airport.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    To
                  </Label>
                  <Select 
                    value={tripData.to} 
                    onValueChange={(value) => setTripData(prev => ({ ...prev, to: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map(airport => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.city} ({airport.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Departure
                  </Label>
                  <Input
                    type="date"
                    value={tripData.departDate}
                    onChange={(e) => setTripData(prev => ({ ...prev, departDate: e.target.value }))}
                  />
                </div>

                {tripData.tripType === 'roundtrip' && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Return
                    </Label>
                    <Input
                      type="date"
                      value={tripData.returnDate}
                      onChange={(e) => setTripData(prev => ({ ...prev, returnDate: e.target.value }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Travelers
                  </Label>
                  <Select 
                    value={tripData.travelers} 
                    onValueChange={(value) => setTripData(prev => ({ ...prev, travelers: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Traveler' : 'Travelers'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleSearch}
              >
                Search Flights
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Popular Destinations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularDestinations.map((dest, index) => (
              <motion.button
                key={dest.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDestinationClick(dest.code)}
                className="relative group rounded-xl overflow-hidden aspect-[4/3]"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <h3 className="text-white font-semibold">{dest.name}</h3>
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <IndianRupee className="h-3 w-3" />
                    <span>From {dest.price}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Travel Tip</h3>
                  <p className="text-sm text-muted-foreground">
                    Book flights 2-3 weeks in advance for the best prices. Tuesdays and Wednesdays 
                    typically offer lower fares than weekends.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
