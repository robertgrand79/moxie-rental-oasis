
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap, Star, HandHeart } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: CheckCircle,
      title: "Integrity First",
      description: "We prioritize unwavering honesty, transparency, and ethical practices in all aspects of our business.",
      gradientColors: "from-gradient-from/30 to-gradient-accent-from/30",
      borderColor: "border-gradient-from/20",
      iconBg: "from-gradient-from to-gradient-accent-from"
    },
    {
      icon: Zap,
      title: "Fast Action Experience",
      description: "We provide swift and efficient solutions while ensuring a seamless and enjoyable experience for our guests.",
      gradientColors: "from-icon-blue/20 to-icon-indigo/20",
      borderColor: "border-icon-blue/30",
      iconBg: "from-icon-blue to-icon-indigo"
    },
    {
      icon: Star,
      title: "Undisputable Value",
      description: "We provide unparalleled experiences that are unmatched in the industry, ensuring exceptional value.",
      gradientColors: "from-icon-amber/20 to-icon-orange/20",
      borderColor: "border-icon-amber/30",
      iconBg: "from-icon-amber to-icon-orange"
    },
    {
      icon: HandHeart,
      title: "People Over Profits",
      description: "We prioritize the well-being, satisfaction, and success of our guests and communities above all financial considerations.",
      gradientColors: "from-icon-emerald/20 to-icon-teal/20",
      borderColor: "border-icon-emerald/30",
      iconBg: "from-icon-emerald to-icon-teal"
    }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20 hover:shadow-3xl transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The core principles that guide everything we do
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <Card key={index} className={`group text-center hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${value.gradientColors} backdrop-blur-sm border ${value.borderColor} hover:-translate-y-2 transform-gpu`}>
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ValuesSection;
