
import React from 'react';
import PropertyShowcase from '@/components/PropertyShowcase';
import HospitableSearchBar from '@/components/HospitableSearchBar';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Vacation Rentals
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our collection of premium vacation rental properties in the most desirable destinations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <HospitableSearchBar />
        </div>

        {/* Hospitable Search Widget */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-8">
          <div className="text-center mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Stay</h3>
            <p className="text-gray-600 text-sm sm:text-base">Search and book your ideal vacation rental</p>
          </div>
          <hospitable-direct-mps identifier="fd74480f-9b42-4ff4-bd3d-c586d3ae77ab" type="custom" results-url="/search"></hospitable-direct-mps>
        </div>

        {/* Property Showcase */}
        <PropertyShowcase />

        {/* Features Section */}
        <div className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Premium Locations</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Handpicked properties in the most desirable vacation destinations.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Our dedicated team is here to help you every step of the way.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Easy Booking</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Simple and secure booking process with instant confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listings;
