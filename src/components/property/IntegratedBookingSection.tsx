
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Property } from '@/types/property';

interface IntegratedBookingSectionProps {
  property: Property;
}

const IntegratedBookingSection = ({ property }: IntegratedBookingSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  const hasBookingUrl = property.hospitable_booking_url && property.hospitable_booking_url.trim() !== '';

  const handleExternalFallback = () => {
    if (hasBookingUrl) {
      window.open(property.hospitable_booking_url, '_blank');
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (!hasBookingUrl) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Booking Coming Soon
        </h3>
        <p className="text-gray-600 mb-6 text-sm">
          Booking information will be available soon. Please check back later or contact us directly.
        </p>
        <Button variant="outline" disabled>
          Booking Not Available
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Complete Your Reservation</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExternalFallback}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Open in New Tab
        </Button>
      </div>

      <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ height: '80vh', minHeight: '600px' }}>
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading booking interface...</span>
            </div>
          </div>
        )}
        
        {/* Embedded Booking Interface */}
        <iframe
          src={property.hospitable_booking_url}
          className="w-full h-full border-0"
          title={`Book ${property.title}`}
          allow="payment; camera; microphone; geolocation"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
};

export default IntegratedBookingSection;
