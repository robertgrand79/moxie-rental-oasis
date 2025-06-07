
import React from 'react';
import { Home, MapPin, Coffee, Trees, Building, Sparkles, User, Star } from 'lucide-react';

const WhyMoxieSection = () => {
  const whyMoxieFeatures = [
    {
      icon: Home,
      title: "Local Living",
      description: "Experience Eugene like a local with properties in tree-lined neighborhoods and walkable areas."
    },
    {
      icon: MapPin,
      title: "Prime Eugene Locations",
      description: "Strategically located in Eugene's most charming and walkable neighborhoods."
    },
    {
      icon: Coffee,
      title: "Artisan Coffee Culture",
      description: "Locally roasted coffee and access to Eugene's vibrant artisan coffee scene."
    },
    {
      icon: Trees,
      title: "Pacific Northwest Nature",
      description: "Easy access to lush trails, Hendricks Park, and Oregon's natural beauty."
    },
    {
      icon: Building,
      title: "Modern Comfort",
      description: "Homes styled with warmth, character, and contemporary Pacific Northwest design."
    },
    {
      icon: Sparkles,
      title: "Curated Details",
      description: "Thoughtfully curated welcome baskets and guidebooks to hidden local spots."
    },
    {
      icon: User,
      title: "Personal Connection",
      description: "Stays that feel personal, memorable, and connected to Eugene's community spirit."
    },
    {
      icon: Star,
      title: "Local Expertise",
      description: "Your gateway to discovering Eugene like you've always belonged here."
    }
  ];

  return (
    <div className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              The Moxie Eugene Experience
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              More than just a place to stay—your gateway to authentic Eugene living
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyMoxieFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center border border-gray-100 transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-gradient-accent-to to-gradient-to rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyMoxieSection;
