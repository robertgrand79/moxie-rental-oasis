
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Star } from 'lucide-react';
import { Property } from '@/types/property';

interface AboutPropertySectionProps {
  property: Property;
}

const AboutPropertySection = ({ property }: AboutPropertySectionProps) => {
  return (
    <div className="py-16 bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About This Property</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto"></div>
          </div>
          
          <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              {/* Header with location and quick stats */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">{property.location}</span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-amber-500 fill-current" />
                      <span>Premium Property</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-primary" />
                      <span>Available Year-Round</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main description */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {property.description}
                  </p>
                </div>
                
                {/* Quick highlights grid */}
                <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-primary">{property.bedrooms}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">Bedrooms</h4>
                    <p className="text-sm text-gray-600">Comfortable sleeping</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-primary">{property.bathrooms}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">Bathrooms</h4>
                    <p className="text-sm text-gray-600">Modern fixtures</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-primary">{property.max_guests}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">Guests</h4>
                    <p className="text-sm text-gray-600">Maximum capacity</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPropertySection;
