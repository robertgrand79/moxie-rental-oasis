
import React from 'react';
import { CheckCircle, Zap, Star, HandHeart } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: CheckCircle,
      title: "Integrity First",
      description: "We prioritize unwavering honesty, transparency, and ethical practices in all aspects of our business."
    },
    {
      icon: Zap,
      title: "Fast Action Experience",
      description: "We provide swift and efficient solutions while ensuring a seamless and enjoyable experience for our guests."
    },
    {
      icon: Star,
      title: "Undisputable Value",
      description: "We provide unparalleled experiences that are unmatched in the industry, ensuring exceptional value."
    },
    {
      icon: HandHeart,
      title: "People Over Profits",
      description: "We prioritize the well-being, satisfaction, and success of our guests and communities above all financial considerations."
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Values</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{value.title}</h4>
                </div>
                <p className="text-gray-600 leading-relaxed pl-13">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ValuesSection;
