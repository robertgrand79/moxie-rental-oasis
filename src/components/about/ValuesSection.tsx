
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap, Star, HandHeart } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: CheckCircle,
      title: "Integrity First",
      description: "We prioritize unwavering honesty, transparency, and ethical practices in all aspects of our business.",
      color: "text-blue-600"
    },
    {
      icon: Zap,
      title: "Fast Action Experience",
      description: "We provide swift and efficient solutions while ensuring a seamless and enjoyable experience for our guests.",
      color: "text-purple-600"
    },
    {
      icon: Star,
      title: "Undisputable Value",
      description: "We provide unparalleled experiences that are unmatched in the industry, ensuring exceptional value.",
      color: "text-yellow-500"
    },
    {
      icon: HandHeart,
      title: "People Over Profits",
      description: "We prioritize the well-being, satisfaction, and success of our guests and communities above all financial considerations.",
      color: "text-red-500"
    }
  ];

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {values.map((value, index) => {
          const IconComponent = value.icon;
          return (
            <Card key={index} className="text-center hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-xl border-white/20">
              <CardContent className="p-8">
                <IconComponent className={`h-16 w-16 ${value.color} mx-auto mb-6`} />
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ValuesSection;
