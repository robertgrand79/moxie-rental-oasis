
import React from 'react';

const AboutHero = () => {
  return (
    <div className="py-32 relative">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            About Moxie Vacation Rentals
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-12"></div>
          <p className="text-2xl text-gray-700 max-w-5xl mx-auto leading-relaxed">
            We're passionate about creating unforgettable vacation experiences through 
            carefully curated properties in Eugene, Oregon and the Pacific Northwest.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutHero;
