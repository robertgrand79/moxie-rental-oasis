
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OptimizedImage from '@/components/ui/optimized-image';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ArrowRight, Play, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2850&q=80"
          alt="Eugene Oregon landscape with mountains and river"
          className="w-full h-full object-cover"
          priority={true}
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl">
            {/* Location Badge */}
            <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/30">
              <MapPin className="h-4 w-4 text-white mr-2" />
              <span className="text-white text-sm font-medium">Eugene, Oregon</span>
              <div className="flex items-center ml-3 pl-3 border-l border-white/30">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-white text-sm ml-1">4.9 Host Rating</span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Your Home Base for
              <span className="block bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Living Like a Local
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl mt-2">
                in Eugene
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl leading-relaxed">
              From Ducks football to wine country adventures, discover Eugene through 
              our thoughtfully curated vacation rentals in the heart of the Pacific Northwest.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-gray-300">Premium Properties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1000+</div>
                <div className="text-sm text-gray-300">Happy Guests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-300">Support Available</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Link to="/listings">
                <EnhancedButton 
                  variant="gradient" 
                  size="lg" 
                  className="min-w-[200px] text-lg shadow-2xl hover:shadow-xl transition-shadow"
                  icon={<ArrowRight className="h-5 w-5" />}
                >
                  Explore Properties
                </EnhancedButton>
              </Link>
              <Link to="/experiences">
                <EnhancedButton 
                  variant="outline" 
                  size="lg" 
                  className="min-w-[200px] text-lg bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                  icon={<Play className="h-5 w-5" />}
                >
                  Virtual Tour
                </EnhancedButton>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 pt-8 border-t border-white/20">
              <p className="text-sm text-gray-300 mb-4">Trusted by travelers from:</p>
              <div className="flex items-center gap-6 text-white/70">
                <span className="text-sm">🇺🇸 United States</span>
                <span className="text-sm">🇨🇦 Canada</span>
                <span className="text-sm">🇬🇧 United Kingdom</span>
                <span className="text-sm">🇩🇪 Germany</span>
                <span className="text-sm">🇯🇵 Japan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
