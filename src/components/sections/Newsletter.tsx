import { useState } from 'react';
import { FadeIn } from '@/components/effects/FadeIn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowRight, Plane } from 'lucide-react';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({ title: 'Subscribed!', description: 'Thanks for joining TripPilot.' });
      setEmail('');
    }
  };

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
      <div className="container mx-auto max-w-2xl text-center relative z-10">
        <FadeIn>
          <Mail className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Get Travel Insights</h2>
          <p className="text-muted-foreground mb-8">Subscribe for tips, updates, and exclusive features.</p>
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your@email.com" className="flex-1 bg-card" required />
            <Button type="submit" className="glow-primary"><ArrowRight className="w-5 h-5" /></Button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
};

export const Footer = () => (
  <footer className="py-12 px-4 border-t border-border/50">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2 font-display font-semibold text-foreground">
        <Plane className="w-5 h-5 text-primary" /> TripPilot
      </div>
      <p>© 2024 TripPilot. Built for the Hackathon.</p>
      <div className="flex gap-4">
        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
      </div>
    </div>
  </footer>
);

export default Newsletter;
