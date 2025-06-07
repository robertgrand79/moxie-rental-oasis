
import React from 'react';
import PropertyShowcase from '@/components/PropertyShowcase';
import HospitableSearchBar from '@/components/HospitableSearchBar';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import { useEffect } from 'react';

const Listings = () => {
  useEffect(() => {
    // Load Hospitable search widget script
    const script = document.createElement('script');
    script.src = 'https://hospitable.b-cdn.net/direct-property-search-widget/hospitable-search-widget.prod.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://hospitable.b-cdn.net/direct-property-search-widget/hospitable-search-widget.prod.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

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

        {/* Search Bar */}
        <div className="mb-12">
          <HospitableSearchBar />
        </div>

        {/* Hospitable Search Widget */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-16 border border-white/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Stay</h3>
            <p className="text-gray-600 text-lg">Search and book your ideal vacation rental</p>
          </div>
          <hospitable-direct-mps identifier="fd74480f-9b42-4ff4-bd3d-c586d3ae77ab" type="custom" results-url="/search"></hospitable-direct-mps>
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
