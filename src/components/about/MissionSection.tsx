
import React from 'react';
import { Target } from 'lucide-react';

const MissionSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Target className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
        </div>
        
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            Our mission at Moxie Vacation Rentals is to create remarkable vacation experiences that embody 
            the spirit of Oregon. We aim to combine outdoor adventures, culinary delights, and stylish 
            accommodations to offer our guests a truly unforgettable stay.
          </p>
          
          <p className="text-gray-600 leading-relaxed">
            With our expertise in hospitality, home improvement, and interior design, we are dedicated to 
            providing exceptional service and curating experiences that reflect the unique charm of the 
            Pacific Northwest. Our goal is to exceed guest expectations and leave them with cherished 
            memories of their time spent in Oregon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionSection;
