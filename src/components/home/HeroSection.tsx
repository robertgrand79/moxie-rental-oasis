
import React from 'react';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Updated default values to match the database defaults from useStableSiteSettings
const DEFAULT_HERO_SETTINGS = {
  heroTitle: 'Your Home Away From Home',
  heroSubtitle: 'in Eugene',
  heroDescription: 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.',
  heroLocationText: 'Eugene, Oregon',
  heroCTAText: 'View Properties'
};

const HeroSection = () => {
  // Fetch hero settings directly from database
  const { data: heroSettings, isLoading } = useQuery({
    queryKey: ['hero-settings'],
    queryFn: async () => {
      console.log('Fetching hero settings from database...');
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'heroTitle',
          'heroSubtitle', 
          'heroDescription',
          'heroLocationText',
          'heroCTAText'
        ]);

      if (error) {
        console.error('Error fetching hero settings:', error);
        return DEFAULT_HERO_SETTINGS;
      }

      console.log('Raw hero settings from database:', data);

      // Convert array to object and handle empty/null values properly
      const settingsMap = data?.reduce((acc, setting) => {
        // Only use database value if it's not null, undefined, or empty string
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      console.log('Processed hero settings (non-empty values only):', settingsMap);

      // Merge with defaults - database values override defaults only if they exist and are not empty
      const finalSettings = {
        ...DEFAULT_HERO_SETTINGS,
        ...settingsMap
      };

      console.log('Final hero settings with defaults:', finalSettings);
      return finalSettings;
    },
    // Reduced refetch interval to 10 seconds for faster updates
    refetchInterval: 10000,
    // Reduced stale time to 5 seconds
    staleTime: 5000
  });

  // Show loading state
  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800"></div>
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="h-16 bg-white/20 rounded animate-pulse"></div>
            <div className="h-8 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  // Use fetched settings or fallback
  const settings = heroSettings || DEFAULT_HERO_SETTINGS;
  
  console.log('Hero Section - Using settings:', settings);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gray Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            {settings.heroTitle}
            <span className="text-accent block sm:inline sm:ml-3">
              {settings.heroSubtitle}
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            {settings.heroDescription}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 py-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">5-Star Experiences</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">{settings.heroLocationText}</span>
            </div>
          </div>

          {/* Single CTA Button */}
          <div className="flex justify-center items-center pt-4">
            <Button 
              asChild
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-4 text-lg"
            >
              <Link to="/properties" className="flex items-center space-x-2">
                <span>{settings.heroCTAText}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
