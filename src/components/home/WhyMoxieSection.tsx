
import React from 'react';
import { Shield, Heart, MapPin, Star } from 'lucide-react';

const WhyMoxieSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Trusted & Verified",
      description: "Every property is personally inspected and verified for quality, safety, and authenticity."
    },
    {
      icon: Heart,
      title: "Local Hospitality",
      description: "Eugene-based hosts who care about your experience and know the city's hidden gems."
    },
    {
      icon: MapPin,
      title: "Prime Locations",
      description: "Handpicked properties in Eugene's most walkable and desirable neighborhoods."
    },
    {
      icon: Star,
      title: "Exceptional Experience",
      description: "Curated amenities and personal touches that make your stay memorable."
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 mx-auto border border-white/30">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Moxie
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're not just providing a place to stay—we're creating authentic Eugene experiences
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
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

export default WhyMoxieSection;
