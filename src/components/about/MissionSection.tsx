
import React from 'react';

const MissionSection = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20 hover:shadow-3xl transition-all duration-300">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto"></div>
        </div>
        
        <div className="space-y-8">
          <p className="text-xl text-gray-700 leading-relaxed">
            Our mission at Moxie Vacation Rentals is to create remarkable vacation experiences that embody 
            the spirit of Oregon. We aim to combine outdoor adventures, culinary delights, and stylish 
            accommodations to offer our guests a truly unforgettable stay.
          </p>
          
          <div className="bg-gradient-to-r from-gradient-accent-from/30 to-gradient-accent-to/30 rounded-2xl p-8 border border-gradient-accent-from/20">
            <p className="text-lg text-gray-700 leading-relaxed">
              With our expertise in hospitality, home improvement, and interior design, we are dedicated to 
              providing exceptional service and curating experiences that reflect the unique charm of the 
              Pacific Northwest. Our goal is to exceed guest expectations and leave them with cherished 
              memories of their time spent in Oregon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionSection;
