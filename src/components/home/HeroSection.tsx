
import React from 'react';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import OptimizedImage from '@/components/ui/optimized-image';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';

const HeroSection = () => {
  const { settings, loading } = useStableSiteSettings();

  // Show loading state while settings are being fetched
  if (loading) {
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

  // Use settings values or fallbacks
  const heroTitle = settings.heroTitle || 'Discover Eugene\'s';
  const heroSubtitle = settings.heroSubtitle || 'Hidden Gems';
  const heroDescription = settings.heroDescription || 'Experience the Pacific Northwest\'s best-kept secret with our curated collection of luxury vacation rentals in the heart of Oregon\'s cultural capital.';
  const heroLocationText = settings.heroLocationText || 'Prime Locations';
  const heroCTAText = settings.heroCTAText || 'View Properties';
  
  // Use the uploaded image if available, otherwise use the default fallback
  const heroBackgroundImage = settings.heroBackgroundImage || '/lovable-uploads/d73f2e35-5081-40d8-a4a8-62765cdea308.png';

  console.log('Hero Section - Current background image:', heroBackgroundImage);
  console.log('Hero Section - All settings:', settings);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with proper spacing */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={heroBackgroundImage}
          alt="Eugene Oregon scenic background"
          className="w-full h-full object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            {heroTitle}
            <span className="text-accent block sm:inline sm:ml-3">
              {heroSubtitle}
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            {heroDescription}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 py-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">5-Star Experiences</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">{heroLocationText}</span>
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
                <span>{heroCTAText}</span>
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
