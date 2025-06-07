
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyShowcase from '@/components/PropertyShowcase';
import HospitableSearchBar from '@/components/HospitableSearchBar';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') || '';
  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const guests = searchParams.get('guests') || '';

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
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 sm:mb-8 border border-white/20">
          <HospitableSearchBar />
        </div>
        
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-16 mx-auto border border-white/20">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Search Results
              {location && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  in {location}
                </span>
              )}
            </h1>
            
            {(checkin || checkout || guests) && (
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {checkin && <span>Check-in: {checkin}</span>}
                {checkout && <span>Check-out: {checkout}</span>}
                {guests && <span>Guests: {guests}</span>}
              </div>
            )}
          </div>

          {/* Hospitable Search Widget */}
          <div className="mb-8">
            <hospitable-direct-mps identifier="fd74480f-9b42-4ff4-bd3d-c586d3ae77ab" type="custom"></hospitable-direct-mps>
          </div>

          <PropertyShowcase />
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
