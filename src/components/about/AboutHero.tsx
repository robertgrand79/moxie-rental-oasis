
import React from 'react';
import { Heart, Users, Star } from 'lucide-react';

const AboutHero = () => {
  return (
    <div className="py-32 relative">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            About Moxie Vacation Rentals
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-12"></div>
          <p className="text-2xl text-gray-700 max-w-5xl mx-auto leading-relaxed">
            We're passionate about creating unforgettable vacation experiences through 
            carefully curated properties in Eugene, Oregon and the Pacific Northwest.
          </p>
          
          {/* Enhanced visual elements */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-gradient-from/20 to-gradient-accent-from/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-gradient-from/30">
                <Heart className="h-8 w-8 text-icon-rose" />
              </div>
              <p className="text-sm font-medium text-gray-600">Passionate</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-gradient-from/20 to-gradient-accent-from/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-gradient-from/30">
                <Users className="h-8 w-8 text-icon-blue" />
              </div>
              <p className="text-sm font-medium text-gray-600">Family-Owned</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-gradient-from/20 to-gradient-accent-from/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-gradient-from/30">
                <Star className="h-8 w-8 text-icon-amber" />
              </div>
              <p className="text-sm font-medium text-gray-600">Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutHero;
