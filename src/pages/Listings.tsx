
import React, { useState } from 'react';
import PropertyShowcase from '@/components/PropertyShowcase';
import PropertyMap from '@/components/PropertyMap';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';

const Listings = () => {
  const { properties } = useProperties();
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

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

        {/* Property Showcase */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mb-16 border border-white/20">
          <PropertyShowcase />
        </div>

        {/* Map Section */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-16 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Property Locations</h2>
            </div>
            {!mapboxToken && (
              <Button 
                variant="outline" 
                onClick={() => setShowTokenInput(!showTokenInput)}
                size="sm"
              >
                Configure Map
              </Button>
            )}
          </div>
          
          {showTokenInput && !mapboxToken && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-3">
                Enter your Mapbox public token to display property locations. 
                Get your token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => setShowTokenInput(false)} size="sm">
                  Apply
                </Button>
              </div>
            </div>
          )}
          
          <PropertyMap properties={properties} mapboxToken={mapboxToken} />
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
