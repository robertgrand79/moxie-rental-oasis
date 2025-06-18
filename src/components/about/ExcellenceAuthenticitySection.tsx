
import React from 'react';
import { Award, Heart } from 'lucide-react';

const ExcellenceAuthenticitySection = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">What Sets Us Apart</h3>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h4>
            <p className="text-gray-600 leading-relaxed">
              We strive for excellence in every aspect of our business, from the meticulously maintained 
              properties to the curated experiences we provide. We go above and beyond to ensure that 
              our guests have an unforgettable stay.
            </p>
          </div>
          
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-pink-500 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Authenticity</h4>
            <p className="text-gray-600 leading-relaxed">
              We believe in showcasing the true essence of Oregon. From recommending local dining 
              experiences to offering outdoor activities, we provide an authentic and immersive 
              experience that allows guests to truly connect with the beauty and culture of the region.
            </p>
          </div>
        </div>

        {/* Quote section */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <blockquote className="text-xl text-gray-700 italic mb-6 leading-relaxed max-w-4xl mx-auto">
            "Immerse yourself in the wonders of Oregon and indulge in the comfort, style, and hospitality 
            that Moxie Vacation Rentals offers, guided by the expertise of our passionate team."
          </blockquote>
          
          <div className="border-t border-gray-200 pt-6 max-w-md mx-auto">
            <p className="font-semibold text-gray-900 text-lg">— The Moxie Family</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcellenceAuthenticitySection;
