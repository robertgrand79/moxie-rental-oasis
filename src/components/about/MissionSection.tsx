
import React from 'react';
import { Target, Mountain, Coffee } from 'lucide-react';

const MissionSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        {/* Mission content - centered */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
          </div>
          
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-4">
            Our mission at Moxie Vacation Rentals is to create remarkable vacation experiences that embody 
            the spirit of Oregon. We aim to combine outdoor adventures, culinary delights, and stylish 
            accommodations to offer our guests a truly unforgettable stay.
          </p>
          
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            With our expertise in hospitality, home improvement, and interior design, we are dedicated to 
            providing exceptional service and curating experiences that reflect the unique charm of the 
            Pacific Northwest.
          </p>
        </div>

        {/* Feature boxes below mission */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-accent border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mountain className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Outdoor Adventures</h4>
            <p className="text-gray-600 leading-relaxed">
              From hiking trails to scenic waterfalls, we'll guide you to Oregon's most breathtaking 
              outdoor experiences and hidden natural gems.
            </p>
          </div>
          
          <div className="bg-muted border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-gray-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Culinary Delights</h4>
            <p className="text-gray-600 leading-relaxed">
              Discover Eugene's vibrant food scene, from artisan coffee shops to farm-to-table restaurants 
              and local breweries that define Pacific Northwest cuisine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionSection;
