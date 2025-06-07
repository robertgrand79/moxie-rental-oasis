
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyShowcase from '@/components/PropertyShowcase';
import HospitableSearchBar from '@/components/HospitableSearchBar';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') || '';
  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const guests = searchParams.get('guests') || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <HospitableSearchBar />
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
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

        <PropertyShowcase />
      </div>
    </div>
  );
};

export default SearchResults;
