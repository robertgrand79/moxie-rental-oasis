
import React from 'react';
import { Award, Heart } from 'lucide-react';

const ExcellenceAuthenticitySection = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Sets Us Apart</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900">Excellence</h4>
            <p className="text-gray-600 leading-relaxed">
              We strive for excellence in every aspect of our business, from the meticulously maintained 
              properties to the curated experiences we provide. We go above and beyond to ensure that 
              our guests have an unforgettable stay.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900">Authenticity</h4>
            <p className="text-gray-600 leading-relaxed">
              We believe in showcasing the true essence of Oregon. From recommending local dining 
              experiences to offering outdoor activities, we provide an authentic and immersive 
              experience that allows guests to truly connect with the beauty and culture of the region.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcellenceAuthenticitySection;
