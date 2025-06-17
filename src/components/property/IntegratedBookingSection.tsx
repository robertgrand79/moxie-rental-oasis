
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, Shield, Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { Property } from '@/types/property';

interface IntegratedBookingSectionProps {
  property: Property;
}

const IntegratedBookingSection = ({ property }: IntegratedBookingSectionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [popupBlocked, setPopupBlocked] = useState(false);
  
  const hasBookingUrl = property.hospitable_booking_url && property.hospitable_booking_url.trim() !== '';

  const handleExternalFallback = () => {
    if (hasBookingUrl) {
      const newWindow = window.open(property.hospitable_booking_url, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        setPopupBlocked(true);
      }
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (!hasBookingUrl) {
    return (
      <div className="min-h-[600px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Booking Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              We're setting up the booking system for this property. Check back soon or contact us directly.
            </p>
          </div>
          <Button variant="outline" disabled className="px-8">
            Booking Not Available
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[80vh]">
      {/* Moxie Branded Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Reservation</h2>
            <p className="text-gray-600">Secure booking powered by Moxie Vacation Rentals</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <Shield className="h-4 w-4" />
              <span>Secure & Protected</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExternalFallback}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Window
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free Cancellation</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Best Price Guarantee</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>24/7 Support</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">(555) 123-4567</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chat Support</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Popup Blocked Warning */}
      {popupBlocked && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mx-6 mt-4 rounded-r-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                Popup blocked! Please <button onClick={handleExternalFallback} className="underline font-medium">click here</button> to open the booking page in a new window, or allow popups for this site.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Interface */}
      <div className="p-6">
        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '75vh', minHeight: '600px' }}>
          {/* Enhanced Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 z-10">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin mx-auto animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Loading Booking System</h3>
                  <p className="text-sm text-gray-600">Connecting to secure booking platform...</p>
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mt-3">
                    <Shield className="h-3 w-3" />
                    <span>SSL Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Iframe with Better Permissions */}
          <iframe
            src={property.hospitable_booking_url}
            className="w-full h-full border-0"
            title={`Book ${property.title} - Moxie Vacation Rentals`}
            allow="payment; camera; microphone; geolocation; popups"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-modals"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={handleIframeLoad}
            onError={() => setIsLoading(false)}
          />
        </div>

        {/* Bottom Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help with your booking? 
            <Button variant="link" className="p-0 ml-1 h-auto text-sm">
              Contact our support team
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntegratedBookingSection;
