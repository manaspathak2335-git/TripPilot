import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Search, Menu, X, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}
export const Header = ({
  onMenuToggle,
  isMenuOpen
}: HeaderProps) => {
  const [hasNotification] = useState(true);
  return <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div initial={{
          rotate: -10
        }} animate={{
          rotate: 0
        }} transition={{
          type: "spring",
          stiffness: 200
        }} className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-sky flex items-center justify-center glow-accent">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <motion.div animate={{
            scale: [1, 1.2, 1]
          }} transition={{
            repeat: Infinity,
            duration: 2
          }} className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full" />
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gradient">TripPilot</h1>
            
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {['Flights', 'Airports'].map(item => <Button key={item} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
              {item}
            </Button>)}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
            {hasNotification && <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full animate-pulse" />}
          </Button>

          <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-foreground" onClick={onMenuToggle}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div initial={false} animate={{
      height: isMenuOpen ? 'auto' : 0,
      opacity: isMenuOpen ? 1 : 0
    }} transition={{
      duration: 0.2
    }} className={cn("lg:hidden overflow-hidden border-t border-border/50", !isMenuOpen && "pointer-events-none")}>
        <nav className="flex flex-col p-4 gap-2">
          {['Flights', 'Airports', 'Weather', 'Alerts'].map(item => <Button key={item} variant="ghost" className="justify-start text-muted-foreground hover:text-foreground">
              {item}
            </Button>)}
        </nav>
      </motion.div>
    </header>;
};