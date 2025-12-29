import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plane, MapPin, Calendar, Hotel, 
  Activity, ChevronRight, Plus, Clock, CheckCircle2,
  AlertCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTrips, Trip, ItineraryItem } from '@/data/mockItinerary';
import { format, parseISO } from 'date-fns';

const statusConfig = {
  confirmed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  pending: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

const typeConfig = {
  flight: { icon: Plane, color: 'bg-blue-500' },
  hotel: { icon: Hotel, color: 'bg-purple-500' },
  activity: { icon: Activity, color: 'bg-orange-500' },
};

function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const tripStatusColors = {
    upcoming: 'bg-primary text-primary-foreground',
    ongoing: 'bg-green-500 text-white',
    completed: 'bg-muted text-muted-foreground',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full text-left"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-40">
          <img
            src={trip.coverImage}
            alt={trip.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge className={`absolute top-3 right-3 ${tripStatusColors[trip.status]}`}>
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </Badge>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-semibold text-lg">{trip.name}</h3>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <MapPin className="h-3 w-3" />
              {trip.destination}
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d, yyyy')}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </motion.button>
  );
}

function ItineraryItemCard({ item }: { item: ItineraryItem }) {
  const TypeIcon = typeConfig[item.type].icon;
  const StatusIcon = statusConfig[item.status].icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative pl-8 pb-6 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border last:hidden" />
      
      {/* Timeline dot */}
      <div className={`absolute left-0 top-2 w-6 h-6 rounded-full ${typeConfig[item.type].color} flex items-center justify-center`}>
        <TypeIcon className="h-3 w-3 text-white" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">{item.title}</h4>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusConfig[item.status].bg} ${statusConfig[item.status].color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {item.status}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </div>
              </div>

              {item.details?.flightNumber && (
                <div className="mt-2 p-2 bg-muted/50 rounded-lg text-sm">
                  <span className="font-medium">{item.details.flightNumber}</span>
                  <span className="text-muted-foreground"> • {item.details.airline}</span>
                  <div className="text-muted-foreground">
                    {item.details.from} → {item.details.to}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MyItinerary() {
  const navigate = useNavigate();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const filteredTrips = mockTrips.filter(trip => {
    if (activeTab === 'all') return true;
    return trip.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => selectedTrip ? setSelectedTrip(null) : navigate('/map')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-purple-500 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                {selectedTrip ? selectedTrip.name : 'My Itineraries'}
              </span>
            </div>
          </div>
          
          {!selectedTrip && (
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <AnimatePresence mode="wait">
          {selectedTrip ? (
            <motion.div
              key="trip-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Trip Header */}
              <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                <img
                  src={selectedTrip.coverImage}
                  alt={selectedTrip.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                    <MapPin className="h-4 w-4" />
                    {selectedTrip.destination}
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(selectedTrip.startDate), 'MMM d')} - {format(parseISO(selectedTrip.endDate), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>

              {/* Itinerary Items */}
              <h2 className="text-lg font-semibold mb-4">Trip Schedule</h2>
              {selectedTrip.items.length > 0 ? (
                <div>
                  {selectedTrip.items.map(item => (
                    <ItineraryItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">No items yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Start planning your trip by adding flights, hotels, and activities.
                    </p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="trip-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Trip List */}
              <div className="grid gap-4">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TripCard trip={trip} onClick={() => setSelectedTrip(trip)} />
                    </motion.div>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-semibold mb-1">No trips found</h3>
                      <p className="text-sm text-muted-foreground">
                        Start planning your next adventure!
                      </p>
                      <Button className="mt-4" onClick={() => navigate('/plan-trip')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Plan a Trip
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
