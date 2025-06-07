
import React from 'react';
import PropertyShowcase from '@/components/PropertyShowcase';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';

const Listings = () => {
  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Our Vacation Rentals
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Discover our collection of premium vacation rental properties in Eugene, Oregon and the Pacific Northwest's most desirable destinations.
          </p>
        </div>

        {/* Property Showcase */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mb-16 border border-white/20">
          <PropertyShowcase />
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium Locations</h3>
            <p className="text-gray-600 leading-relaxed">
              Handpicked properties in Eugene and the most desirable Pacific Northwest vacation destinations.
            </p>
          </div>
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">24/7 Support</h3>
            <p className="text-gray-600 leading-relaxed">
              Our dedicated team is here to help you every step of the way with exceptional service.
            </p>
          </div>
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Booking</h3>
            <p className="text-gray-600 leading-relaxed">
              Simple and secure booking process with instant confirmation and seamless experience.
            </p>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Listings;
