
import React from 'react';
import { Target, Mountain, Coffee } from 'lucide-react';

const MissionSection = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20 hover:shadow-3xl transition-all duration-300 group">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-12">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto"></div>
        </div>
        
        <div className="space-y-8">
          <p className="text-xl text-gray-700 leading-relaxed">
            Our mission at Moxie Vacation Rentals is to create remarkable vacation experiences that embody 
            the spirit of Oregon. We aim to combine outdoor adventures, culinary delights, and stylish 
            accommodations to offer our guests a truly unforgettable stay.
          </p>
          
          <div className="bg-gradient-to-r from-gradient-accent-from/30 to-gradient-accent-to/30 rounded-2xl p-8 border border-gradient-accent-from/20 hover:shadow-lg transition-all duration-300">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              With our expertise in hospitality, home improvement, and interior design, we are dedicated to 
              providing exceptional service and curating experiences that reflect the unique charm of the 
              Pacific Northwest. Our goal is to exceed guest expectations and leave them with cherished 
              memories of their time spent in Oregon.
            </p>
            
            {/* Mission highlights */}
            <div className="flex justify-center gap-12 mt-8">
              <div className="flex items-center gap-4 group/item">
                <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                  <Mountain className="h-6 w-6 text-icon-emerald" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Outdoor Adventures</h4>
                  <p className="text-sm text-gray-600">Pacific Northwest exploration</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group/item">
                <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                  <Coffee className="h-6 w-6 text-icon-amber" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Culinary Delights</h4>
                  <p className="text-sm text-gray-600">Local food experiences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionSection;
