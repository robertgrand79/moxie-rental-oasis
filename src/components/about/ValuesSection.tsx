
import React from 'react';
import { CheckCircle, Zap, Star, HandHeart } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: CheckCircle,
      title: "Integrity First",
      description: "We prioritize unwavering honesty, transparency, and ethical practices in all aspects of our business.",
      bgColor: "bg-gradient-to-br from-gradient-from to-gradient-to",
      borderColor: "border-gray-200",
      iconBg: "bg-gray-600"
    },
    {
      icon: Zap,
      title: "Fast Action Experience",
      description: "We provide swift and efficient solutions while ensuring a seamless and enjoyable experience for our guests.",
      bgColor: "bg-muted",
      borderColor: "border-gray-200",
      iconBg: "bg-gray-500"
    },
    {
      icon: Star,
      title: "Undisputable Value",
      description: "We provide unparalleled experiences that are unmatched in the industry, ensuring exceptional value.",
      bgColor: "bg-accent",
      borderColor: "border-gray-200",
      iconBg: "bg-gray-700"
    },
    {
      icon: HandHeart,
      title: "People Over Profits",
      description: "We prioritize the well-being, satisfaction, and success of our guests and communities above all financial considerations.",
      bgColor: "bg-gradient-to-br from-gradient-accent-from to-gradient-accent-to",
      borderColor: "border-gray-200",
      iconBg: "bg-gray-600"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Values</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div key={index} className={`${value.bgColor} ${value.borderColor} border rounded-lg p-6 text-center h-full`}>
                <div className={`w-12 h-12 ${value.iconBg} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">{value.title}</h4>
                <p className="text-gray-600 leading-relaxed text-sm">
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
