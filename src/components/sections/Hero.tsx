import { Aurora } from '@/components/effects/Aurora';
import { DecryptedText } from '@/components/effects/DecryptedText';
import { FadeIn } from '@/components/effects/FadeIn';
import { Button } from '@/components/ui/button';
import { Plane, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora Background */}
      <Aurora
        colorStops={['#0066FF', '#4A90E2', '#6B46C1', '#0066FF']}
        amplitude={1.2}
        speed={0.8}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]" />

      {/* Animated plane elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-full animate-plane-move opacity-20">
          <Plane className="w-8 h-8 text-primary rotate-45" />
        </div>
        <div className="absolute top-2/3 left-0 w-full animate-plane-move opacity-10" style={{ animationDelay: '-10s' }}>
          <Plane className="w-6 h-6 text-secondary rotate-45" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <FadeIn delay={200}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Powered by Google Gemini AI
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight">
            <DecryptedText
              text="Your AI-Powered"
              className="block text-gradient-aurora"
              speed={40}
            />
            <DecryptedText
              text="Travel Companion"
              className="block text-foreground mt-2"
              speed={40}
              delay={500}
            />
          </h1>
        </FadeIn>

        <FadeIn delay={600}>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Track flights in real-time, discover airport amenities, and get intelligent travel recommendations — all powered by cutting-edge AI.
          </p>
        </FadeIn>

        <FadeIn delay={800}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="group relative px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 glow-primary transition-all duration-300"
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/flights');
                  } else {
                    navigate('/signup');
                  }
                }}
              >
                <span>Get Started</span>
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/flights')}
              className="px-8 py-6 text-lg font-semibold border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/50 transition-all duration-300"
            >
              <Plane className="mr-2 w-5 h-5" />
              Track a Flight
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Hero;
