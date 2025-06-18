
import React from 'react';
import { Home, Award, Heart, Star } from 'lucide-react';

const RobertShellyIntroduction = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Creative Photo Mosaic */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg h-96 relative">
              {/* Hero photo - large and prominent */}
              <div className="absolute top-0 left-0 w-3/5 h-3/5 overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 z-10">
                <img 
                  src="/lovable-uploads/dfe77e53-d5e7-44f1-be6c-7fd801ecc7fa.png"
                  alt="Robert and Shelly - Main photo"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Medium photo - top right */}
              <div className="absolute top-0 right-0 w-2/5 h-1/2 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-20">
                <img 
                  src="/lovable-uploads/d1f71962-f44a-4556-b875-d05f2a8a537a.png"
                  alt="Robert and Shelly outdoors"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Medium photo - bottom left */}
              <div className="absolute bottom-0 left-0 w-1/2 h-2/5 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-20">
                <img 
                  src="/lovable-uploads/11aea8e1-1241-453f-bc09-d4c8c7394c8c.png"
                  alt="Robert and Shelly lifestyle"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Accent photo - small bottom right */}
              <div className="absolute bottom-0 right-0 w-2/5 h-1/3 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 z-30">
                <img 
                  src="/lovable-uploads/ca979f86-d583-4e11-a233-176ed76d2d7b.png"
                  alt="Robert and Shelly community"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative elements for depth */}
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute bottom-8 left-8 w-4 h-4 bg-orange-500 rounded-full opacity-30"></div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Robert & Shelly</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We're thrilled to welcome you to Moxie Vacation Rentals, where Oregon hospitality meets exceptional service.
                As lifelong Oregon residents, we've spent decades exploring every corner of this beautiful state.
              </p>
            </div>

            {/* Feature boxes with colored backgrounds */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Local Expertise</h4>
                <p className="text-xs text-gray-600">Deep roots in Oregon with knowledge of every hidden gem</p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Quality Focus</h4>
                <p className="text-xs text-gray-600">Every property carefully curated and maintained</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Passionate Hosts</h4>
                <p className="text-xs text-gray-600">Genuine love for Oregon and exceptional service</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Family Values</h4>
                <p className="text-xs text-gray-600">Family-owned business creating memorable experiences</p>
              </div>
            </div>

            {/* Quote section */}
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
              <blockquote className="text-lg text-gray-700 italic mb-4">
                "We believe in creating spaces where families can come together, where memories are made, 
                and where the beauty of Oregon becomes part of your story."
              </blockquote>
              <p className="font-semibold text-gray-900">— Robert & Shelly</p>
            </div>

            {/* Bottom tagline and tags */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">Your local ambassadors to the heart of Oregon</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Oregon</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Local</span>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">Quality</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Family</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobertShellyIntroduction;
