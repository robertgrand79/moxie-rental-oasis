
import React from 'react';
import { Mountain } from 'lucide-react';

const EugeneInfoSection = () => {
  return (
    <div className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
                  Discover the 
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Heart of Eugene
                  </span>
                </h2>
                <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                  <p>
                    Immerse yourself in Eugene's vibrant community spirit—from tree-lined neighborhoods 
                    and artisan coffee shops to the passionate college town energy of Duck football and 
                    the renowned Saturday Market showcasing local artisans and musicians.
                  </p>
                  <p>
                    Experience the best of Pacific Northwest living with morning runs through Hendricks Park, 
                    wine country tours, and nights out at 5th Street Public Market. Our homes put you in 
                    the heart of Eugene's most walkable and charming areas.
                  </p>
                  <p className="font-semibold text-gray-900 text-xl">
                    Whether you're here for the Olympic trials, a family visit, or to soak up Oregon life, 
                    Moxie is your gateway to discovering Eugene like you've always belonged here.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-1 shadow-2xl">
                  <div className="bg-white rounded-3xl p-8">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mountain className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Pacific Northwest Living</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Located in Eugene's most charming neighborhoods, offering authentic Oregon experiences 
                        from lush trails to vibrant farmers markets and everything in between.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EugeneInfoSection;
