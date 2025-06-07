
import React from 'react';
import LocalFavorites from '@/components/experiences/LocalFavorites';

const Experiences = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Local Favorites
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the best local spots our guests love to visit. From hidden gems to popular attractions, 
            we've curated the perfect guide to help you experience the area like a local.
          </p>
        </div>
        <LocalFavorites />
      </div>
    </div>
  );
};

export default Experiences;
