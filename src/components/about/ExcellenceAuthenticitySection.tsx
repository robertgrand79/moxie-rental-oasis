
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart } from 'lucide-react';

const ExcellenceAuthenticitySection = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20 hover:shadow-3xl transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">What Sets Us Apart</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our commitment to excellence and authenticity in every guest experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <Card className="group hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-white/30 hover:-translate-y-2">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-semibold mb-6 text-gray-900">Excellence</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                We strive for excellence in every aspect of our business, from the meticulously maintained 
                properties to the curated experiences we provide. We go above and beyond to ensure that 
                our guests have an unforgettable stay.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-white/30 hover:-translate-y-2">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-semibold mb-6 text-gray-900">Authenticity</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
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
