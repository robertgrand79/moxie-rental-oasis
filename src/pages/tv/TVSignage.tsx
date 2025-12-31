import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import TVLayout, { tvStyles } from '@/components/tv/TVLayout';
import TVWeatherWidget from '@/components/tv/TVWeatherWidget';
import { supabase } from '@/integrations/supabase/client';
import { useGuidebook } from '@/hooks/useGuidebookManagement';

type SlideType = 'welcome' | 'weather' | 'highlights' | 'info';

interface PropertyData {
  id: string;
  title: string;
  organization_id: string;
}

/**
 * TVSignage - Digital signage mode for lobby displays
 * 
 * Features:
 * - Auto-rotating content slides
 * - Welcome, weather, and local highlights
 * - Clock overlay
 * - Touch/key exits to guest portal
 */
const TVSignage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch property data
  const { data: property, isLoading: propertyLoading } = useQuery<PropertyData>({
    queryKey: ['property-signage', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, organization_id')
        .eq('id', propertyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });

  // Fetch assistant settings for rotation timing
  const { data: settings } = useQuery({
    queryKey: ['assistant-settings-signage', property?.organization_id],
    queryFn: async () => {
      if (!property?.organization_id) return null;
      const { data } = await supabase
        .from('assistant_settings')
        .select('tv_signage_rotation_seconds, display_name')
        .eq('organization_id', property.organization_id)
        .single();
      return data;
    },
    enabled: !!property?.organization_id,
  });

  // Fetch guidebook for highlights
  const { data: guidebook } = useGuidebook(propertyId);

  const slides: SlideType[] = ['welcome', 'weather', 'highlights', 'info'];
  const rotationSeconds = settings?.tv_signage_rotation_seconds || 10;

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, rotationSeconds * 1000);

    return () => clearInterval(interval);
  }, [rotationSeconds, slides.length]);

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Exit on any interaction
  const handleExit = useCallback(() => {
    navigate(`/tv/${propertyId}/portal`);
  }, [navigate, propertyId]);

  useEffect(() => {
    const handleKeyDown = () => handleExit();
    const handleClick = () => handleExit();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [handleExit]);

  if (propertyLoading) {
    return (
      <TVLayout className="flex items-center justify-center">
        <Loader2 className={cn(tvStyles.iconLarge, "animate-spin text-primary")} />
      </TVLayout>
    );
  }

  const content = guidebook?.content;
  const restaurants = content?.local_recommendations?.restaurants || [];
  const activities = content?.local_recommendations?.activities || [];

  return (
    <TVLayout className="relative overflow-hidden">
      {/* Clock Overlay */}
      <div className="absolute top-8 right-8 z-10 text-right">
        <p className={cn(tvStyles.heading2, "font-light")}>
          {currentTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}
        </p>
        <p className={tvStyles.bodySmall}>
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Slide Content */}
      <div className="h-full flex items-center justify-center">
        <div 
          className={cn(
            "w-full max-w-5xl transition-opacity duration-500",
            "animate-fade-in"
          )}
          key={currentSlide}
        >
          {slides[currentSlide] === 'welcome' && (
            <WelcomeSlide 
              propertyName={property?.title || 'Welcome'} 
              assistantName={settings?.display_name}
            />
          )}
          {slides[currentSlide] === 'weather' && (
            <WeatherSlide propertyId={propertyId} />
          )}
          {slides[currentSlide] === 'highlights' && (
            <HighlightsSlide 
              restaurants={restaurants}
              activities={activities}
            />
          )}
          {slides[currentSlide] === 'info' && (
            <InfoSlide content={content} />
          )}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === currentSlide 
                ? "bg-primary w-8" 
                : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Exit Hint */}
      <p className="absolute bottom-8 right-8 text-muted-foreground text-sm">
        Press any key to exit
      </p>
    </TVLayout>
  );
};

// Welcome Slide
const WelcomeSlide: React.FC<{ propertyName: string; assistantName?: string }> = ({ 
  propertyName, 
  assistantName 
}) => (
  <div className="text-center space-y-8">
    <h1 className={cn(tvStyles.heading1, "text-primary")}>
      Welcome
    </h1>
    <h2 className={tvStyles.heading2}>
      {propertyName}
    </h2>
    {assistantName && (
      <p className={tvStyles.body}>
        Ask {assistantName} for assistance
      </p>
    )}
  </div>
);

// Weather Slide
const WeatherSlide: React.FC<{ propertyId?: string }> = ({ propertyId }) => (
  <div className="space-y-8">
    <h2 className={cn(tvStyles.heading2, "text-center mb-8")}>
      Today's Weather
    </h2>
    <TVWeatherWidget propertyId={propertyId} variant="expanded" />
  </div>
);

// Highlights Slide
const HighlightsSlide: React.FC<{ 
  restaurants: any[];
  activities: any[];
}> = ({ restaurants, activities }) => (
  <div className="space-y-8">
    <h2 className={cn(tvStyles.heading2, "text-center")}>
      Local Highlights
    </h2>
    
    <div className="grid grid-cols-2 gap-8">
      {/* Top Restaurant */}
      {restaurants[0] && (
        <div className="bg-card border border-border rounded-2xl p-8">
          <p className={cn(tvStyles.caption, "mb-2")}>🍽️ Featured Restaurant</p>
          <h3 className={tvStyles.heading3}>{restaurants[0].name}</h3>
          <p className={tvStyles.body}>{restaurants[0].description}</p>
          <p className={cn(tvStyles.caption, "mt-4")}>{restaurants[0].distance}</p>
        </div>
      )}
      
      {/* Top Activity */}
      {activities[0] && (
        <div className="bg-card border border-border rounded-2xl p-8">
          <p className={cn(tvStyles.caption, "mb-2")}>🎯 Featured Activity</p>
          <h3 className={tvStyles.heading3}>{activities[0].name}</h3>
          <p className={tvStyles.body}>{activities[0].description}</p>
          <p className={cn(tvStyles.caption, "mt-4")}>{activities[0].distance}</p>
        </div>
      )}
    </div>

    {restaurants.length === 0 && activities.length === 0 && (
      <p className={cn(tvStyles.body, "text-center text-muted-foreground")}>
        Explore local attractions on the guest portal
      </p>
    )}
  </div>
);

// Info Slide
const InfoSlide: React.FC<{ content: any }> = ({ content }) => (
  <div className="space-y-8">
    <h2 className={cn(tvStyles.heading2, "text-center")}>
      Quick Info
    </h2>
    
    <div className="grid grid-cols-3 gap-6">
      {content?.wifi && (
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <p className={cn(tvStyles.caption, "mb-2")}>📶 WiFi</p>
          <p className={tvStyles.heading3}>{content.wifi.network}</p>
        </div>
      )}
      
      {content?.check_in_time && (
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <p className={cn(tvStyles.caption, "mb-2")}>🔑 Check-in</p>
          <p className={tvStyles.heading3}>{content.check_in_time}</p>
        </div>
      )}
      
      {content?.check_out_time && (
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <p className={cn(tvStyles.caption, "mb-2")}>🚪 Check-out</p>
          <p className={tvStyles.heading3}>{content.check_out_time}</p>
        </div>
      )}
    </div>

    {!content && (
      <p className={cn(tvStyles.body, "text-center text-muted-foreground")}>
        View full property details on the guest portal
      </p>
    )}
  </div>
);

export default TVSignage;
