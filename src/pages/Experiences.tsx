
import React from 'react';
import LocalFavorites from '@/components/experiences/LocalFavorites';
import Footer from '@/components/Footer';

const Experiences = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Local Favorites
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the best local spots our guests love to visit. From hidden gems to popular attractions, 
              we've curated the perfect guide to help you experience the area like a local.
            </p>
          </div>
          <LocalFavorites />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Experiences;
