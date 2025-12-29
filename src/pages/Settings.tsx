import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Settings as SettingsIcon, User, Bell, 
  Shield, Globe, Moon, Sun, Smartphone, Mail,
  LogOut, ChevronRight, Plane
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SettingsSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function SettingsSection({ title, icon: Icon, children }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

function SettingRow({ 
  label, 
  description, 
  children 
}: { 
  label: string; 
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    notifications: {
      flightAlerts: true,
      priceDrops: true,
      emailUpdates: false,
      pushNotifications: true,
    },
    preferences: {
      theme: 'system',
      language: 'en',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
    privacy: {
      shareData: false,
      locationAccess: true,
    },
  });

  const handleToggle = (category: 'notifications' | 'privacy', key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !(prev[category] as Record<string, boolean>)[key],
      },
    }));
    toast({
      title: 'Setting updated',
      description: 'Your preference has been saved.',
    });
  };

  const handleSelectChange = (category: 'preferences', key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    toast({
      title: 'Setting updated',
      description: 'Your preference has been saved.',
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/map')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 ml-3">
            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
              <SettingsIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-lg font-bold">Settings</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{user?.name || 'User'}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
                </div>
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SettingsSection title="Notifications" icon={Bell}>
            <SettingRow label="Flight Alerts" description="Get notified about flight status changes">
              <Switch
                checked={settings.notifications.flightAlerts}
                onCheckedChange={() => handleToggle('notifications', 'flightAlerts')}
              />
            </SettingRow>
            <Separator />
            <SettingRow label="Price Drop Alerts" description="Notify when prices drop for saved routes">
              <Switch
                checked={settings.notifications.priceDrops}
                onCheckedChange={() => handleToggle('notifications', 'priceDrops')}
              />
            </SettingRow>
            <Separator />
            <SettingRow label="Email Updates" description="Receive weekly travel updates">
              <Switch
                checked={settings.notifications.emailUpdates}
                onCheckedChange={() => handleToggle('notifications', 'emailUpdates')}
              />
            </SettingRow>
            <Separator />
            <SettingRow label="Push Notifications" description="Allow push notifications on this device">
              <Switch
                checked={settings.notifications.pushNotifications}
                onCheckedChange={() => handleToggle('notifications', 'pushNotifications')}
              />
            </SettingRow>
          </SettingsSection>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SettingsSection title="Preferences" icon={Globe}>
            <SettingRow label="Theme" description="Choose your preferred theme">
              <Select
                value={settings.preferences.theme}
                onValueChange={(value) => handleSelectChange('preferences', 'theme', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <Separator />
            <SettingRow label="Language">
              <Select
                value={settings.preferences.language}
                onValueChange={(value) => handleSelectChange('preferences', 'language', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                  <SelectItem value="ta">தமிழ்</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <Separator />
            <SettingRow label="Currency">
              <Select
                value={settings.preferences.currency}
                onValueChange={(value) => handleSelectChange('preferences', 'currency', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ INR</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </SettingsSection>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SettingsSection title="Privacy & Security" icon={Shield}>
            <SettingRow label="Share Usage Data" description="Help improve TripPilot by sharing anonymous usage data">
              <Switch
                checked={settings.privacy.shareData}
                onCheckedChange={() => handleToggle('privacy', 'shareData')}
              />
            </SettingRow>
            <Separator />
            <SettingRow label="Location Access" description="Allow location access for nearby airport info">
              <Switch
                checked={settings.privacy.locationAccess}
                onCheckedChange={() => handleToggle('privacy', 'locationAccess')}
              />
            </SettingRow>
          </SettingsSection>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {/* Version Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground"
        >
          TripPilot v1.0.0 • Made with ❤️ in India
        </motion.p>
      </main>
    </div>
  );
}
