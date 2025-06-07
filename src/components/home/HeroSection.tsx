
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      <div className="relative py-24 sm:py-32 lg:py-40 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Your Home Base for Living Like a Local in Eugene
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover Eugene, Oregon through thoughtfully curated vacation rentals in the heart of 
              the Pacific Northwest. From Ducks football to wine country tours, your Eugene adventure starts here.
            </p>
          </div>

          {/* Elegant Search Widget */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto border border-white/20 overflow-hidden">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Find Your Eugene Sanctuary</h3>
              <p className="text-gray-600 text-lg">Discover your perfect home base in Eugene, Oregon</p>
            </div>
            <div className="w-full">
              <hospitable-direct-mps identifier="fd74480f-9b42-4ff4-bd3d-c586d3ae77ab" type="custom" results-url="/search"></hospitable-direct-mps>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
