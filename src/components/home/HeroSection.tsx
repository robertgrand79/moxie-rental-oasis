
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OptimizedImage from '@/components/ui/optimized-image';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      <div className="relative py-20 sm:py-24 lg:py-32 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <OptimizedImage 
                src="/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png" 
                alt="Moxie Vacation Rentals" 
                width={160}
                height={160}
                priority={true}
                className="h-40 w-auto drop-shadow-lg"
              />
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Your Home Base for Living Like a 
              <span className="block bg-gradient-to-r from-gradient-from to-gradient-accent-from bg-clip-text text-transparent">
                Local in Eugene
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover Eugene, Oregon through thoughtfully curated vacation rentals in the heart of 
              the Pacific Northwest. From Ducks football to wine country tours, your Eugene adventure starts here.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/listings">
                <EnhancedButton 
                  variant="gradient" 
                  size="lg" 
                  className="min-w-[200px]"
                  icon={<ArrowRight className="h-5 w-5" />}
                >
                  Explore Properties
                </EnhancedButton>
              </Link>
              <Link to="/experiences">
                <EnhancedButton 
                  variant="outline" 
                  size="lg" 
                  className="min-w-[200px]"
                >
                  Eugene Experiences
                </EnhancedButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
