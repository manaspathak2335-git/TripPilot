import { motion } from 'framer-motion';
import { AlertTriangle, CloudRain, Cloud, Sun, Eye, X } from 'lucide-react';
import { weatherData, getWeatherAlerts } from '@/data/weather';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  onClose?: () => void;
}

export const WeatherWidget = ({ onClose }: WeatherWidgetProps) => {
  const alerts = getWeatherAlerts();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-strong rounded-xl border border-border/50 overflow-hidden"
    >
      <div className="p-3 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Weather Alerts
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{alerts.length} active</span>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-2 max-h-48 overflow-y-auto custom-scrollbar">
        {alerts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">No active alerts</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((weather) => (
              <motion.div
                key={weather.airportCode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "p-3 rounded-lg border",
                  weather.severity === 'red' 
                    ? 'bg-destructive/10 border-destructive/30' 
                    : 'bg-warning/10 border-warning/30'
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">{weather.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">{weather.airportCode}</span>
                      <span className="text-xs text-muted-foreground">{weather.city}</span>
                    </div>
                    <p className="text-xs mt-1 line-clamp-2">{weather.alert}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {weather.visibility >= 1000 
                          ? `${(weather.visibility / 1000).toFixed(1)}km` 
                          : `${weather.visibility}m`
                        }
                      </span>
                      <span>{weather.temperature}°C</span>
                      <span>{weather.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick weather overview */}
      <div className="p-2 border-t border-border/50">
        <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
          {weatherData.slice(0, 6).map((weather) => (
            <div
              key={weather.airportCode}
              className={cn(
                "flex-shrink-0 px-2 py-1 rounded-md text-center min-w-[60px]",
                weather.severity === 'red' ? 'bg-destructive/20' :
                weather.severity === 'yellow' ? 'bg-warning/20' :
                'bg-muted/30'
              )}
            >
              <p className="font-mono text-xs font-medium">{weather.airportCode}</p>
              <p className="text-sm">{weather.icon}</p>
              <p className="text-xs text-muted-foreground">{weather.temperature}°</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
