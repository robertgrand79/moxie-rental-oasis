
import React from 'react';
import { Wifi, Car, Coffee, Utensils, Tv, Waves, TreePine, Dumbbell } from 'lucide-react';

const AmenitiesSection = () => {
  const amenities = [
    { icon: Wifi, name: "High-Speed WiFi" },
    { icon: Car, name: "Free Parking" },
    { icon: Coffee, name: "Coffee & Tea" },
    { icon: Utensils, name: "Full Kitchen" },
    { icon: Tv, name: "Smart TV" },
    { icon: Waves, name: "Hot Tub" },
    { icon: TreePine, name: "Garden Access" },
    { icon: Dumbbell, name: "Fitness Access" }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 mx-auto border border-white/30">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Premium Amenities
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Every Moxie property comes thoughtfully equipped with everything you need for a comfortable stay
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {amenities.map((amenity, index) => {
              const IconComponent = amenity.icon;
              return (
                <div key={index} className="group text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gradient-from/20 to-gradient-accent-from/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 border border-gradient-from/30">
                    <IconComponent className="h-6 w-6 text-gray-700" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {amenity.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
