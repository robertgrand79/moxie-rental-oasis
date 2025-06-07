
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const HospitableSearchBar = () => {
  useEffect(() => {
    // Load Hospitable script
    const script = document.createElement('script');
    script.src = 'https://widget.hospitable.com/js/booking-widget.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://widget.hospitable.com/js/booking-widget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-4xl mx-auto -mt-4 sm:-mt-8 relative z-10">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Stay</h3>
        <p className="text-gray-600 text-sm sm:text-base">Search and book your ideal vacation rental</p>
      </div>
      
      {/* Hospitable Widget Container */}
      <div 
        id="hospitable-booking-widget"
        className="hospitable-widget"
        data-property-id="your-property-id"
        data-theme="light"
      >
        {/* Search form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input 
              type="text" 
              placeholder="Where are you going?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
            <input 
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
            <input 
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
              <option>1 Guest</option>
              <option>2 Guests</option>
              <option>3 Guests</option>
              <option>4 Guests</option>
              <option>5+ Guests</option>
            </select>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 text-center">
          <Button size="lg" className="px-6 sm:px-8 w-full sm:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Search Properties
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HospitableSearchBar;
