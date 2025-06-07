
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Heart } from 'lucide-react';

const ExcellenceAuthenticitySection = () => {
  return (
    <div className="grid md:grid-cols-2 gap-8 mb-16">
      <Card className="hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-xl border-white/20">
        <CardContent className="p-12">
          <Award className="h-16 w-16 text-blue-600 mb-6" />
          <h3 className="text-2xl font-semibold mb-6">Excellence</h3>
          <p className="text-gray-600 leading-relaxed text-lg">
            We strive for excellence in every aspect of our business, from the meticulously maintained 
            properties to the curated experiences we provide. We go above and beyond to ensure that 
            our guests have an unforgettable stay.
          </p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-2xl transition-shadow bg-white/95 backdrop-blur-xl border-white/20">
        <CardContent className="p-12">
          <Heart className="h-16 w-16 text-purple-600 mb-6" />
          <h3 className="text-2xl font-semibold mb-6">Authenticity</h3>
          <p className="text-gray-600 leading-relaxed text-lg">
            We believe in showcasing the true essence of Oregon. From recommending local dining 
            experiences to offering outdoor activities, we provide an authentic and immersive 
            experience that allows guests to truly connect with the beauty and culture of the region.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcellenceAuthenticitySection;
