
import React from 'react';
import { ArrowRight, MapPin, Star, Users, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useHeroSettings } from './hooks/useHeroSettings';
import { useRatingMetrics } from '@/hooks/useRatingMetrics';
import AnimatedBackground from './ModernHeroBackground';

const ModernHeroSection = () => {
  const { settings, isLoading } = useHeroSettings();
  const { metrics, isLoading: isRatingLoading } = useRatingMetrics();

  if (isLoading) {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="animate-pulse text-white text-center">
          <div className="h-16 bg-white/20 rounded-lg w-96 mx-auto mb-4"></div>
          <div className="h-8 bg-white/20 rounded-lg w-64 mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content Container - Centered */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-8">
            
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-medium animate-fade-in">
              <Award className="w-4 h-4 text-accent" />
              <span>Premium Vacation Rentals</span>
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-accent bg-clip-text text-transparent">
                  {settings.heroTitle}
                </span>
                <br />
                <span className="bg-gradient-to-r from-accent via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {settings.heroSubtitle}
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
                {settings.heroDescription}
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex justify-center items-center gap-12 py-6">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  {metrics && !isRatingLoading ? metrics.formattedRating : '5.0'}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <div className="text-sm text-gray-300">Rating</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  {metrics && !isRatingLoading 
                    ? `${metrics.totalReviews >= 100 ? `${Math.floor(metrics.totalReviews / 10) * 10}+` : `${metrics.totalReviews}+`}`
                    : '90+'
                  }
                </div>
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div className="text-sm text-gray-300">Happy Guests</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">24/7</div>
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div className="text-sm text-gray-300">Support</div>
              </div>
            </div>

            {/* Location Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
              <MapPin className="w-5 h-5 text-accent" />
              <span className="text-white font-medium">{settings.heroLocationText}</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-accent to-pink-500 hover:from-accent/90 hover:to-pink-500/90 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105"
              >
                <Link to="/properties" className="flex items-center gap-2">
                  <span>{settings.heroCTAText}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                size="lg" 
                className="border-2 border-white/30 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg rounded-full"
              >
                <Link to="/experiences">
                  <span>Explore Eugene</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center backdrop-blur-sm">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default ModernHeroSection;
