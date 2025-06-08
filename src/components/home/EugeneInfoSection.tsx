
import React from 'react';
import { Mountain, Coffee, TreePine } from 'lucide-react';

const EugeneInfoSection = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/30">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Content Side */}
            <div className="p-12 lg:p-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Discover the 
                <span className="block bg-gradient-to-r from-gradient-from to-gradient-accent-from bg-clip-text text-transparent">
                  Heart of Eugene
                </span>
              </h2>
              
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed mb-8">
                <p>
                  Immerse yourself in Eugene's vibrant community spirit—from tree-lined neighborhoods 
                  and artisan coffee shops to the passionate college town energy of Duck football and 
                  the renowned Saturday Market.
                </p>
                <p>
                  Experience the best of Pacific Northwest living with morning runs through Hendricks Park, 
                  wine country tours, and nights out at 5th Street Public Market.
                </p>
              </div>

              <div className="bg-gradient-to-r from-gradient-from/10 to-gradient-accent-from/10 rounded-2xl p-6 border border-gradient-from/20">
                <p className="font-semibold text-gray-900 text-xl">
                  Whether you're here for the Olympic trials, a family visit, or to soak up Oregon life, 
                  Moxie is your gateway to authentic Eugene living.
                </p>
              </div>
            </div>

            {/* Visual Side */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-12 lg:p-16 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col items-center group">
                    <Mountain className="h-12 w-12 mb-2 text-icon-emerald hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium">Trails</span>
                  </div>
                  <div className="flex flex-col items-center group">
                    <Coffee className="h-12 w-12 mb-2 text-icon-amber hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium">Coffee</span>
                  </div>
                  <div className="flex flex-col items-center group">
                    <TreePine className="h-12 w-12 mb-2 text-icon-green hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium">Nature</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Pacific Northwest Living</h3>
                <p className="opacity-90 leading-relaxed">
                  Located in Eugene's most charming neighborhoods, offering authentic Oregon experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EugeneInfoSection;
