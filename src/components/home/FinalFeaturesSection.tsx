
import React from 'react';
import { Coffee, Star, Trees } from 'lucide-react';

const FinalFeaturesSection = () => {
  const features = [
    {
      icon: Coffee,
      title: "Local Eugene Culture",
      description: "Immerse yourself in Eugene's artisan coffee culture, vibrant markets, and passionate college town spirit."
    },
    {
      icon: Star,
      title: "Local Expert Hosts",
      description: "Our Eugene-based team provides insider knowledge and curated guides to the city's hidden gems."
    },
    {
      icon: Trees,
      title: "Pacific Northwest Access",
      description: "Perfect location for exploring Oregon's wine country, natural trails, and the broader Pacific Northwest."
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 mx-auto border border-white/30">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              The Moxie Difference
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8 rounded-full"></div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
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

export default FinalFeaturesSection;
