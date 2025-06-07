
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap, Star, HandHeart } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: CheckCircle,
      title: "Integrity First",
      description: "We prioritize unwavering honesty, transparency, and ethical practices in all aspects of our business.",
      color: "text-gradient-from"
    },
    {
      icon: Zap,
      title: "Fast Action Experience",
      description: "We provide swift and efficient solutions while ensuring a seamless and enjoyable experience for our guests.",
      color: "text-gradient-accent-from"
    },
    {
      icon: Star,
      title: "Undisputable Value",
      description: "We provide unparalleled experiences that are unmatched in the industry, ensuring exceptional value.",
      color: "text-gradient-from"
    },
    {
      icon: HandHeart,
      title: "People Over Profits",
      description: "We prioritize the well-being, satisfaction, and success of our guests and communities above all financial considerations.",
      color: "text-gradient-accent-from"
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
              <Card key={index} className="group text-center hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-white/30 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className={`h-8 w-8 text-white`} />
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
