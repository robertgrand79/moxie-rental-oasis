
import React from 'react';
import { Coffee, Star, Trees } from 'lucide-react';

const FinalFeaturesSection = () => {
  return (
    <div className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              Why Choose Moxie in Eugene
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Coffee className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Local Eugene Culture</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Immerse yourself in Eugene's artisan coffee culture, vibrant markets, and passionate college town spirit.
              </p>
            </div>
            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Local Expert Hosts</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Our Eugene-based team provides insider knowledge and curated guides to the city's hidden gems.
              </p>
            </div>
            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trees className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Pacific Northwest Access</h3>
              <p className="text-gray-200 text-lg leading-relaxed">
                Perfect location for exploring Oregon's wine country, natural trails, and the broader Pacific Northwest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalFeaturesSection;
