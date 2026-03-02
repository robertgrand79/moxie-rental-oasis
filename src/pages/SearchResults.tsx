import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchPropertyResults from '@/components/SearchPropertyResults';
import InternalSearchBar from '@/components/InternalSearchBar';
import { format, parseISO } from 'date-fns';
import { useTenantProperties } from '@/hooks/useTenantProperties';
import { generateAddressSlug } from '@/utils/addressSlug';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const guests = searchParams.get('guests') || '';
  const { properties, loading: propertiesLoading } = useTenantProperties();

  // Single property redirect: skip search results and go straight to booking
  useEffect(() => {
    if (!propertiesLoading && properties.length === 1) {
      const property = properties[0];
      const addressSlug = generateAddressSlug(property.location);
      const params = new URLSearchParams();
      if (checkin) params.set('checkin', checkin);
      if (checkout) params.set('checkout', checkout);
      params.set('tab', 'booking');
      navigate(`/property/${addressSlug}?${params.toString()}`, { replace: true });
    }
  }, [propertiesLoading, properties, checkin, checkout, navigate]);

  // Format dates for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Don't render search results page if we're about to redirect
  if (!propertiesLoading && properties.length === 1) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 sm:mb-8 border border-border/20">
          <InternalSearchBar />
        </div>
        
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-16 mx-auto border border-border/20">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
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
