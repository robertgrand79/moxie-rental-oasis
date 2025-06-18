
import React from 'react';
import { Home, Award, Heart, Star } from 'lucide-react';

const RobertShellyIntroduction = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Clean Modern Photo Collage */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              {/* Top row - two photos */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="aspect-square overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="/lovable-uploads/2600a527-3948-441b-a42f-582e1f8934f2.png"
                    alt="Robert and Shelly at mountain lake"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="/lovable-uploads/4e137420-dc2e-41d2-b27d-19630692ffff.png"
                    alt="Robert and Shelly at sporting event"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              
              {/* Bottom row - two photos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="/lovable-uploads/4ac8bb55-fe2f-4e35-8def-f735c5440591.png"
                    alt="Robert and Shelly in garden setting"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="/lovable-uploads/559a12e3-50e5-4cee-86e9-154fd60cd0fe.png"
                    alt="Robert and Shelly at cultural site"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
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
