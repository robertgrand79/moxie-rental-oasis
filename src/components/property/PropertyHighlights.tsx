
import React from 'react';
import { Property } from '@/types/property';

interface PropertyHighlightsProps {
  property: Property;
  isMobile: boolean;
}

const PropertyHighlights = ({ property, isMobile }: PropertyHighlightsProps) => {
  if (isMobile) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-xl font-bold text-primary">{property.bedrooms}</div>
            <div className="text-sm text-gray-600">Bedrooms</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-primary">{property.bathrooms}</div>
            <div className="text-sm text-gray-600">Bathrooms</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-primary">{property.max_guests}</div>
            <div className="text-sm text-gray-600">Guests</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
      <div className="text-center group">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
          <span className="text-2xl font-bold text-primary">{property.bedrooms}</span>
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">Bedrooms</h4>
        <p className="text-sm text-gray-600">Comfortable sleeping</p>
      </div>
      <div className="text-center group">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
          <span className="text-2xl font-bold text-primary">{property.bathrooms}</span>
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">Bathrooms</h4>
        <p className="text-sm text-gray-600">Modern fixtures</p>
      </div>
      <div className="text-center group">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
          <span className="text-2xl font-bold text-primary">{property.max_guests}</span>
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">Guests</h4>
        <p className="text-sm text-gray-600">Maximum capacity</p>
      </div>
    </div>
  );
};

export default PropertyHighlights;
