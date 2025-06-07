
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OptimizedImage from '@/components/ui/optimized-image';

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      <div className="relative py-16 sm:py-20 lg:py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Your Home Base for Living Like a Local in Eugene
            </h1>
            <div className="flex justify-center mb-8">
              <OptimizedImage 
                src="/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png" 
                alt="Moxie Vacation Rentals" 
                width={192}
                height={192}
                priority={true}
                className="h-48 w-auto"
              />
            </div>
            <p className="text-xl sm:text-2xl text-gray-700 mb-2 max-w-3xl mx-auto leading-relaxed">
              Discover Eugene, Oregon through thoughtfully curated vacation rentals in the heart of 
              the Pacific Northwest. From Ducks football to wine country tours, your Eugene adventure starts here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
