import { SpotlightCard } from '@/components/effects/SpotlightCard';
import { FadeIn } from '@/components/effects/FadeIn';
import { 
  Plane, 
  Map, 
  Bot, 
  MapPin, 
  CloudSun,
  NotebookPen
} from 'lucide-react';

const features = [
  {
    icon: Plane,
    title: 'Real-Time Flight Tracking',
    description: 'Monitor your flights with live position updates, altitude, speed, and estimated arrival times.',
    color: 'text-primary',
    spotlightColor: 'rgba(0, 102, 255, 0.15)',
  },
  {
    icon: Map,
    title: 'Interactive Map Visualization',
    description: 'See aircraft moving across a beautiful world map with smooth animations and detailed overlays.',
    color: 'text-secondary',
    spotlightColor: 'rgba(74, 144, 226, 0.15)',
  },
  {
    icon: Bot,
    title: 'AI Travel Assistant',
    description: 'Ask anything about your trip and get intelligent, personalized recommendations powered by Gemini AI.',
    color: 'text-aviation-sunset',
    spotlightColor: 'rgba(245, 158, 11, 0.15)',
  },
  {
    icon: MapPin,
    title: 'Airport Amenities & Places',
    description: 'Discover restaurants, lounges, shops, and services at airports worldwide.',
    color: 'text-green-400',
    spotlightColor: 'rgba(74, 222, 128, 0.15)',
  },
  {
    icon: CloudSun,
    title: 'Weather & Alerts',
    description: 'Stay informed with real-time weather conditions and important travel alerts for your destinations.',
    color: 'text-purple-400',
    spotlightColor: 'rgba(167, 139, 250, 0.15)',
  },
  {
    icon: NotebookPen,
    title: 'Plan Trips & Itineraries',
    description: 'Plan your perfect trip with our intelligent itinerary builder and personalized travel recommendations.',
    color: 'text-purple-400',
    spotlightColor: 'rgba(167, 139, 250, 0.15)',
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 px-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />

      <div className="container mx-auto relative z-10">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient-primary">Everything You Need</span>
              <span className="block text-foreground">For Seamless Travel</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              TripPilot combines powerful flight tracking with intelligent AI to make every journey smoother.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 100}>
              <SpotlightCard
                spotlightColor={feature.spotlightColor}
                className="h-full hover-lift"
              >
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mb-4 ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </div>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
