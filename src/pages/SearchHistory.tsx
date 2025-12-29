import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Plane, MapPin, Calendar, 
  Trash2, Clock, Filter, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { mockSearchHistory, SearchHistoryItem } from '@/data/mockSearchHistory';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

function SearchHistoryCard({ 
  item, 
  onDelete, 
  onSearch 
}: { 
  item: SearchHistoryItem; 
  onDelete: (id: string) => void;
  onSearch: (item: SearchHistoryItem) => void;
}) {
  const isFlightSearch = item.type === 'flight';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              isFlightSearch ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
            }`}>
              {isFlightSearch ? <Plane className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-medium text-foreground truncate">{item.query}</h3>
                <Badge variant="secondary" className="shrink-0">
                  {item.resultCount} {item.resultCount === 1 ? 'result' : 'results'}
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-1 text-sm text-muted-foreground">
                {isFlightSearch && item.details.from && item.details.to && (
                  <div className="flex items-center gap-2">
                    <span>{item.details.from}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{item.details.to}</span>
                  </div>
                )}
                
                {isFlightSearch && item.details.flightNumber && (
                  <div className="flex items-center gap-2">
                    <span>Flight: {item.details.flightNumber}</span>
                  </div>
                )}
                
                {!isFlightSearch && item.details.airportName && (
                  <div className="truncate">{item.details.airportName}</div>
                )}
                
                {item.details.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{item.details.date}</span>
                  </div>
                )}
              </div>

              {/* Timestamp & Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
                </div>
                
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete search?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove "{item.query}" from your search history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(item.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button size="sm" variant="outline" onClick={() => onSearch(item)}>
                    <Search className="h-3 w-3 mr-1" />
                    Search Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SearchHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState(mockSearchHistory);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredHistory = history.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    toast({
      title: 'Search deleted',
      description: 'The search has been removed from your history.',
    });
  };

  const handleClearAll = () => {
    setHistory([]);
    toast({
      title: 'History cleared',
      description: 'All search history has been deleted.',
    });
  };

  const handleSearch = (item: SearchHistoryItem) => {
    if (item.type === 'flight' && item.details.from && item.details.to) {
      navigate(`/map?from=${item.details.from}&to=${item.details.to}`);
    } else if (item.details.airportCode) {
      navigate(`/map?airport=${item.details.airportCode}`);
    } else {
      navigate('/map');
    }
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
              <div className="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center">
                <Search className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">Search History</span>
            </div>
          </div>

          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive">
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your search history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {history.length > 0 ? (
          <>
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    All ({history.length})
                  </TabsTrigger>
                  <TabsTrigger value="flight" className="flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    Flights ({history.filter(h => h.type === 'flight').length})
                  </TabsTrigger>
                  <TabsTrigger value="airport" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Airports ({history.filter(h => h.type === 'airport').length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {/* History List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredHistory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SearchHistoryCard
                      item={item}
                      onDelete={handleDelete}
                      onSearch={handleSearch}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredHistory.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No {activeFilter} searches</h3>
                <p className="text-sm text-muted-foreground">
                  Try a different filter or search for something new.
                </p>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No search history</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Your flight and airport searches will appear here for quick access.
            </p>
            <Button onClick={() => navigate('/plan-trip')}>
              <Plane className="h-4 w-4 mr-2" />
              Start Searching
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
