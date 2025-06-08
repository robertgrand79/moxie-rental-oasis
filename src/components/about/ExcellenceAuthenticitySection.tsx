
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart } from 'lucide-react';

const ExcellenceAuthenticitySection = () => {
  return (
    <div className="bg-gradient-to-br from-white/95 via-gradient-accent-from/25 to-gradient-accent-to/35 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/30 hover:shadow-3xl transition-all duration-500 group relative overflow-hidden">
      {/* Enhanced decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gradient-from/15 via-transparent to-gradient-accent-from/15 opacity-60"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-icon-rose/25 to-icon-purple/20 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-icon-blue/25 to-icon-indigo/20 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
      <div className="absolute center w-48 h-48 bg-gradient-to-r from-icon-emerald/15 to-icon-teal/15 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">What Sets Us Apart</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8 shadow-lg"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our commitment to excellence and authenticity in every guest experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <Card className="group/card hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-icon-blue/30 to-icon-indigo/30 backdrop-blur-sm border border-icon-blue/40 hover:-translate-y-3 transform-gpu hover:scale-[1.02] relative overflow-hidden">
            {/* Card decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-icon-blue/10 to-icon-indigo/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-xl opacity-50"></div>
            
            <CardContent className="p-12 text-center relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-icon-blue to-icon-indigo rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover/card:scale-125 transition-all duration-500 shadow-xl group-hover/card:shadow-2xl">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-semibold mb-6 text-gray-900 group-hover/card:text-gray-800 transition-colors duration-300">Excellence</h3>
              <p className="text-gray-600 leading-relaxed text-lg group-hover/card:text-gray-700 transition-colors duration-300">
                We strive for excellence in every aspect of our business, from the meticulously maintained 
                properties to the curated experiences we provide. We go above and beyond to ensure that 
                our guests have an unforgettable stay.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group/card hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-icon-rose/30 to-icon-purple/30 backdrop-blur-sm border border-icon-rose/40 hover:-translate-y-3 transform-gpu hover:scale-[1.02] relative overflow-hidden">
            {/* Card decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-icon-rose/10 to-icon-purple/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl opacity-50"></div>
            
            <CardContent className="p-12 text-center relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-icon-rose to-icon-purple rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover/card:scale-125 transition-all duration-500 shadow-xl group-hover/card:shadow-2xl">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-semibold mb-6 text-gray-900 group-hover/card:text-gray-800 transition-colors duration-300">Authenticity</h3>
              <p className="text-gray-600 leading-relaxed text-lg group-hover/card:text-gray-700 transition-colors duration-300">
                We believe in showcasing the true essence of Oregon. From recommending local dining 
                experiences to offering outdoor activities, we provide an authentic and immersive 
                experience that allows guests to truly connect with the beauty and culture of the region.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExcellenceAuthenticitySection;
