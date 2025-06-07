
import React from 'react';

const MissionSection = () => {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Mission</h2>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-12 text-white border border-white/20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl leading-relaxed mb-6">
            Our mission at Moxie Vacation Rentals is to create remarkable vacation experiences that embody 
            the spirit of Oregon. We aim to combine outdoor adventures, culinary delights, and stylish 
            accommodations to offer our guests a truly unforgettable stay.
          </p>
          <p className="text-lg leading-relaxed">
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
