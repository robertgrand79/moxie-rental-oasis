
import React from 'react';
import { Wifi, Car, Coffee, Utensils, Tv, Waves, TreePine, Dumbbell } from 'lucide-react';

const AmenitiesSection = () => {
  const amenities = [
    { icon: Wifi, name: "High-Speed WiFi", color: "text-icon-blue" },
    { icon: Car, name: "Free Parking", color: "text-icon-gray" },
    { icon: Coffee, name: "Coffee & Tea", color: "text-icon-amber" },
    { icon: Utensils, name: "Full Kitchen", color: "text-icon-emerald" },
    { icon: Tv, name: "Smart TV", color: "text-icon-purple" },
    { icon: Waves, name: "Hot Tub", color: "text-icon-teal" },
    { icon: TreePine, name: "Garden Access", color: "text-icon-green" },
    { icon: Dumbbell, name: "Fitness Access", color: "text-icon-orange" }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 border">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Premium Amenities
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every Moxie property comes thoughtfully equipped with everything you need for a comfortable stay
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {amenities.map((amenity, index) => {
              const IconComponent = amenity.icon;
              return (
                <div key={index} className="group text-center">
                  <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-all duration-300 border group-hover:shadow-md group-hover:bg-muted">
                    <IconComponent className={`h-6 w-6 ${amenity.color} transition-colors duration-300`} />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
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
