import React from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchPropertyResults from '@/components/SearchPropertyResults';
import InternalSearchBar from '@/components/InternalSearchBar';
import { format, parseISO } from 'date-fns';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const guests = searchParams.get('guests') || '';

  // Format dates for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 sm:mb-8 border border-white/20">
          <InternalSearchBar />
        </div>
        
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-16 mx-auto border border-white/20">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Search Results
            </h1>
            
            {(checkin || checkout || guests) && (
              <p className="text-muted-foreground">
                {checkin && checkout && (
                  <span>{formatDate(checkin)} - {formatDate(checkout)}</span>
                )}
                {guests && <span> • {guests} {parseInt(guests) === 1 ? 'Guest' : 'Guests'}</span>}
              </p>
            )}
          </div>

          <SearchPropertyResults 
            checkin={checkin} 
            checkout={checkout} 
            guests={guests} 
          />
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
