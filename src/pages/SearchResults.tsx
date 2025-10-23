
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyShowcase from '@/components/PropertyShowcase';
import InternalSearchBar from '@/components/InternalSearchBar';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const guests = searchParams.get('guests') || '';


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 sm:mb-8 border border-white/20">
            <InternalSearchBar />
          </div>
          
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-16 mx-auto border border-white/20">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Search Results
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
      </div>
    </>
  );
};

export default SearchResults;
