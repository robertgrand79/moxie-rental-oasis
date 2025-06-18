
import React from 'react';
import { Heart, Home, Star, Award } from 'lucide-react';

const FamilyDescription = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose Us</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-gray-900">Local Expertise</h4>
            <p className="text-sm text-gray-600">
              Deep roots in Oregon with knowledge of every hidden gem and local favorite.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-gray-900">Quality Focus</h4>
            <p className="text-sm text-gray-600">
              Every property is carefully curated and maintained to the highest standards.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-gray-900">Passionate Hosts</h4>
            <p className="text-sm text-gray-600">
              Genuine love for Oregon and commitment to exceptional guest service.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-gray-900">Family Values</h4>
            <p className="text-sm text-gray-600">
              Family-owned business creating spaces for memorable experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDescription;
