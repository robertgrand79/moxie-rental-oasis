
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Zap, Star, HandHeart } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: CheckCircle,
      title: "Integrity First",
      description: "We prioritize unwavering honesty, transparency, and ethical practices in all aspects of our business.",
      gradientColors: "from-gradient-from/40 to-gradient-accent-from/40",
      borderColor: "border-gradient-from/40",
      iconBg: "from-gradient-from to-gradient-accent-from",
      accentColor: "bg-gradient-to-r from-gradient-from/10 to-gradient-accent-from/10"
    },
    {
      icon: Zap,
      title: "Fast Action Experience",
      description: "We provide swift and efficient solutions while ensuring a seamless and enjoyable experience for our guests.",
      gradientColors: "from-icon-blue/30 to-icon-indigo/30",
      borderColor: "border-icon-blue/40",
      iconBg: "from-icon-blue to-icon-indigo",
      accentColor: "bg-gradient-to-r from-icon-blue/10 to-icon-indigo/10"
    },
    {
      icon: Star,
      title: "Undisputable Value",
      description: "We provide unparalleled experiences that are unmatched in the industry, ensuring exceptional value.",
      gradientColors: "from-icon-amber/30 to-icon-orange/30",
      borderColor: "border-icon-amber/40",
      iconBg: "from-icon-amber to-icon-orange",
      accentColor: "bg-gradient-to-r from-icon-amber/10 to-icon-orange/10"
    },
    {
      icon: HandHeart,
      title: "People Over Profits",
      description: "We prioritize the well-being, satisfaction, and success of our guests and communities above all financial considerations.",
      gradientColors: "from-icon-emerald/30 to-icon-teal/30",
      borderColor: "border-icon-emerald/40",
      iconBg: "from-icon-emerald to-icon-teal",
      accentColor: "bg-gradient-to-r from-icon-emerald/10 to-icon-teal/10"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white/95 via-gradient-accent-from/20 to-gradient-accent-to/30 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/30 hover:shadow-3xl transition-all duration-500 group relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gradient-from/10 via-transparent to-gradient-accent-from/10 opacity-50"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-icon-blue/20 to-transparent rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-icon-emerald/20 to-transparent rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8 shadow-lg"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The core principles that guide everything we do
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <Card key={index} className={`group/card text-center hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${value.gradientColors} backdrop-blur-sm border ${value.borderColor} hover:-translate-y-3 transform-gpu hover:scale-105 relative overflow-hidden`}>
                {/* Card decorative background */}
                <div className={`absolute inset-0 ${value.accentColor} opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`}></div>
                
                <CardContent className="p-8 relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover/card:scale-125 transition-all duration-500 shadow-xl group-hover/card:shadow-2xl`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover/card:text-gray-800 transition-colors duration-300">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed group-hover/card:text-gray-700 transition-colors duration-300">
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
