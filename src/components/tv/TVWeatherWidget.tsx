import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Loader2, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tvStyles } from '@/components/tv/TVLayout';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  configured: boolean;
  current?: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    description: string;
    icon: string;
  };
  forecast?: Array<{
    date: string;
    high: number;
    low: number;
    description: string;
    icon: string;
  }>;
}

interface TVWeatherWidgetProps {
  propertyId?: string;
  variant?: 'compact' | 'expanded';
}

/**
 * TVWeatherWidget - Weather display for TV
 * 
 * Features:
 * - Current temperature and conditions
 * - 5-day forecast
 * - Compact and expanded variants
 * - Graceful fallback if not configured
 */
const TVWeatherWidget: React.FC<TVWeatherWidgetProps> = ({ 
  propertyId, 
  variant = 'compact' 
}) => {
  const { data: weather, isLoading, error } = useQuery<WeatherData>({
    queryKey: ['weather', propertyId],
    queryFn: async () => {
      if (!propertyId) return { configured: false };
      
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { propertyId }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 30 * 60 * 1000, // Auto-refresh every 30 min
  });

  if (isLoading) {
    return (
      <div className={cn(
        "bg-card border border-border rounded-2xl flex items-center justify-center",
        variant === 'compact' ? "p-6" : "p-8"
      )}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !weather?.configured) {
    return (
      <div className={cn(
        "bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground",
        variant === 'compact' ? "p-6" : "p-8"
      )}>
        <CloudOff className="h-10 w-10 mb-2" />
        <p className={tvStyles.caption}>Weather unavailable</p>
      </div>
    );
  }

  if (variant === 'compact') {
    return <CompactWeather weather={weather} />;
  }

  return <ExpandedWeather weather={weather} />;
};

// Compact Weather Display
const CompactWeather: React.FC<{ weather: WeatherData }> = ({ weather }) => {
  const { current } = weather;
  if (!current) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-6">
        <WeatherIcon icon={current.icon} className={tvStyles.iconLarge} />
        <div>
          <p className={cn(tvStyles.heading2, "font-bold")}>{Math.round(current.temp)}°F</p>
          <p className={tvStyles.caption}>{current.description}</p>
        </div>
        <div className="ml-auto flex gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6" />
            <span className={tvStyles.bodySmall}>{current.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-6 w-6" />
            <span className={tvStyles.bodySmall}>{Math.round(current.wind_speed)} mph</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Expanded Weather Display
const ExpandedWeather: React.FC<{ weather: WeatherData }> = ({ weather }) => {
  const { current, forecast } = weather;
  if (!current) return null;

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <div className="bg-card border border-border rounded-2xl p-8">
        <h3 className={cn(tvStyles.heading3, "mb-6")}>Current Weather</h3>
        <div className="flex items-center gap-8">
          <WeatherIcon icon={current.icon} className="h-24 w-24" />
          <div>
            <p className={cn(tvStyles.heading1, "font-bold")}>{Math.round(current.temp)}°F</p>
            <p className={cn(tvStyles.body, "text-muted-foreground")}>
              Feels like {Math.round(current.feels_like)}°F
            </p>
          </div>
          <div className="ml-auto space-y-4">
            <div className="flex items-center gap-3">
              <Droplets className="h-8 w-8 text-blue-400" />
              <span className={tvStyles.body}>Humidity: {current.humidity}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Wind className="h-8 w-8 text-gray-400" />
              <span className={tvStyles.body}>Wind: {Math.round(current.wind_speed)} mph</span>
            </div>
          </div>
        </div>
        <p className={cn(tvStyles.heading3, "mt-4 capitalize")}>{current.description}</p>
      </div>

      {/* Forecast */}
      {forecast && forecast.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-8">
          <h3 className={cn(tvStyles.heading3, "mb-6")}>5-Day Forecast</h3>
          <div className="grid grid-cols-5 gap-4">
            {forecast.slice(0, 5).map((day, index) => (
              <div 
                key={index}
                className="bg-muted rounded-xl p-4 text-center"
                tabIndex={0}
              >
                <p className={tvStyles.bodySmall}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <WeatherIcon icon={day.icon} className="h-12 w-12 mx-auto my-3" />
                <p className={tvStyles.body}>{Math.round(day.high)}°</p>
                <p className={cn(tvStyles.caption, "text-muted-foreground")}>
                  {Math.round(day.low)}°
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Weather Icon Component
const WeatherIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className }) => {
  // Map OpenWeather icon codes to Lucide icons
  const getIcon = () => {
    if (icon.includes('01')) return <Sun className={cn(className, "text-yellow-500")} />;
    if (icon.includes('02') || icon.includes('03') || icon.includes('04')) {
      return <Cloud className={cn(className, "text-gray-400")} />;
    }
    if (icon.includes('09') || icon.includes('10')) {
      return <CloudRain className={cn(className, "text-blue-400")} />;
    }
    if (icon.includes('13')) return <CloudSnow className={cn(className, "text-blue-200")} />;
    return <Cloud className={cn(className, "text-gray-400")} />;
  };

  return getIcon();
};

export default TVWeatherWidget;
