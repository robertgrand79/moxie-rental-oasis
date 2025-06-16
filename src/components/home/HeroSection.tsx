
import React from 'react';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import OptimizedImage from '@/components/ui/optimized-image';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Default fallback values
const DEFAULT_HERO_SETTINGS = {
  heroTitle: 'Discover Eugene\'s',
  heroSubtitle: 'Hidden Gems',
  heroDescription: 'Experience the Pacific Northwest\'s best-kept secret with our curated collection of luxury vacation rentals in the heart of Oregon\'s cultural capital.',
  heroBackgroundImage: '/lovable-uploads/d73f2e35-5081-40d8-a4a8-62765cdea308.png',
  heroLocationText: 'Prime Locations',
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
          'heroBackgroundImage',
          'heroLocationText',
          'heroCTAText'
        ]);

      if (error) {
        console.error('Error fetching hero settings:', error);
        return DEFAULT_HERO_SETTINGS;
      }

      console.log('Raw hero settings from database:', data);

      // Convert array to object
      const settingsMap = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>) || {};

      console.log('Processed hero settings:', settingsMap);

      // Merge with defaults
      const finalSettings = {
        ...DEFAULT_HERO_SETTINGS,
        ...settingsMap
      };

      console.log('Final hero settings with defaults:', finalSettings);
      return finalSettings;
    },
    // Refetch every 30 seconds to pick up changes
    refetchInterval: 30000,
    // Show stale data while refetching
    staleTime: 10000
  });

  // Show loading state
  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
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
  console.log('Hero Section - Background image:', settings.heroBackgroundImage);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={settings.heroBackgroundImage || DEFAULT_HERO_SETTINGS.heroBackgroundImage}
          alt="Eugene Oregon scenic background"
          className="w-full h-full object-cover"
          priority={true}
          onError={(e) => {
            console.error('Hero image failed to load:', settings.heroBackgroundImage);
            // Fallback to default image
            const target = e.target as HTMLImageElement;
            if (target.src !== DEFAULT_HERO_SETTINGS.heroBackgroundImage) {
              target.src = DEFAULT_HERO_SETTINGS.heroBackgroundImage;
            }
          }}
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

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
