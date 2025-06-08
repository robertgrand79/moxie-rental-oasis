
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OptimizedImage from '@/components/ui/optimized-image';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';

const HeroSection = () => {
  const { user } = useAuth();
  const { settings } = useStableSiteSettings();

  // Get hero content from stable site settings with fallbacks
  const heroTitle = settings.heroTitle || 'Your Home Away From Home';
  const heroSubtitle = settings.heroSubtitle || 'in Eugene';
  const heroDescription = settings.heroDescription || 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.';
  const heroBackgroundImage = settings.heroBackgroundImage || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2850&q=80';
  const heroLocationText = settings.heroLocationText || 'Eugene, Oregon';
  const heroRating = settings.heroRating || '4.9';
  const heroCTAText = settings.heroCTAText || 'View Properties';

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src={heroBackgroundImage}
          alt={`${heroLocationText} landscape`}
          className="w-full h-full object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Location Badge */}
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <MapPin className="h-4 w-4 text-white mr-2" />
              <span className="text-white text-sm font-medium">{heroLocationText}</span>
              <div className="flex items-center ml-3 pl-3 border-l border-white/30">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-white text-sm ml-1">{heroRating} Rating</span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              {heroTitle}
              <span className="block text-3xl sm:text-5xl mt-2 text-blue-200">
                {heroSubtitle}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              {heroDescription}
            </p>

            {/* CTA Button */}
            <Link to="/listings">
              <EnhancedButton 
                variant="secondary" 
                size="lg" 
                className="text-lg shadow-xl"
                icon={<ArrowRight className="h-5 w-5" />}
              >
                {heroCTAText}
              </EnhancedButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Simple scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
