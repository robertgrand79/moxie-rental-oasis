
import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Updated default values with proper fallback image
const DEFAULT_HERO_SETTINGS = {
  heroTitle: 'Your Home Away From Home',
  heroSubtitle: 'in Eugene',
  heroDescription: 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.',
  heroLocationText: 'Eugene, Oregon',
  heroCTAText: 'View Properties',
  heroBackgroundImage: 'https://joiovubyokikqjytxtuv.supabase.co/storage/v1/object/public/hero-images/hero-1750167903500.jpg'
};

const HeroSection = () => {
  const [imageStatus, setImageStatus] = useState<{
    loaded: boolean;
    error: boolean;
    tested: boolean;
  }>({
    loaded: false,
    error: false,
    tested: false
  });

  // Fetch hero settings with cache busting for images
  const { data: heroSettings, isLoading, error: queryError } = useQuery({
    queryKey: ['hero-settings-v4'], // Incremented version for cache busting
    queryFn: async () => {
      console.log('🔄 Fetching hero settings from database...');
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'heroTitle',
          'heroSubtitle', 
          'heroDescription',
          'heroLocationText',
          'heroCTAText',
          'heroBackgroundImage'
        ]);

      if (error) {
        console.error('❌ Error fetching hero settings:', error);
        throw error;
      }

      console.log('📄 Raw hero settings from database:', data);

      // Convert array to object
      const settingsMap = data?.reduce((acc, setting) => {
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      console.log('🔧 Processed hero settings:', settingsMap);

      // Merge with defaults
      const finalSettings = {
        ...DEFAULT_HERO_SETTINGS,
        ...settingsMap
      };

      console.log('✅ Final hero settings:', finalSettings);
      return finalSettings;
    },
    staleTime: 1000, // 1 second - much shorter for faster updates
    refetchInterval: false,
    retry: 3
  });

  // Use settings with fallback
  const settings = heroSettings || DEFAULT_HERO_SETTINGS;

  // Test image loading with comprehensive error handling and cache busting
  useEffect(() => {
    if (!settings.heroBackgroundImage) {
      console.log('⚠️ No hero background image set, using gradient');
      setImageStatus({ loaded: true, error: false, tested: true });
      return;
    }

    // Add cache busting parameter to force refresh
    const imageUrlWithCacheBuster = `${settings.heroBackgroundImage}?t=${Date.now()}`;
    console.log('🖼️ Testing hero image with cache buster:', imageUrlWithCacheBuster);
    setImageStatus({ loaded: false, error: false, tested: false });

    const img = new Image();
    
    const handleLoad = () => {
      console.log('✅ Hero image loaded successfully:', settings.heroBackgroundImage);
      setImageStatus({ loaded: true, error: false, tested: true });
    };
    
    const handleError = () => {
      console.error('❌ Failed to load hero image:', settings.heroBackgroundImage);
      setImageStatus({ loaded: false, error: true, tested: true });
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = imageUrlWithCacheBuster;

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [settings.heroBackgroundImage]);

  // Show loading state
  if (isLoading || !imageStatus.tested) {
    console.log('⏳ Hero section loading...');
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

  // Log current state for debugging
  console.log('🎯 Hero Section Render State:', {
    settings,
    imageStatus,
    queryError,
    imageUrl: settings.heroBackgroundImage
  });

  // Determine background - use image only if it loaded successfully
  const shouldUseImage = settings.heroBackgroundImage && 
                        imageStatus.loaded && 
                        !imageStatus.error;

  const backgroundStyle = shouldUseImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${settings.heroBackgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {
        background: 'linear-gradient(135deg, #6B7280 0%, #374151 100%)'
      };

  console.log('🎨 Using background style:', shouldUseImage ? 'Image' : 'Gradient');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={backgroundStyle}
      ></div>

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

          {/* CTA Button */}
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
