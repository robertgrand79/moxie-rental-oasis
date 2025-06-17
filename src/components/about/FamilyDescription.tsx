
import React from 'react';
import { Heart, Home, Star, Award, Users, MapPin } from 'lucide-react';

const FamilyDescription = () => {
  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Meet Robert & Shelly
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-gradient-accent-from mx-auto md:mx-0 mb-8 rounded-full"></div>
      </div>
      
      <div className="space-y-8 text-gray-700">
        <div className="bg-gradient-to-r from-gradient-from/10 to-gradient-accent-from/10 rounded-2xl p-8 border border-gradient-from/20">
          <p className="text-xl leading-relaxed font-medium text-gray-800 mb-4">
            Meet the dynamic duo behind Moxie Vacation Rentals: Robert and Shelly. 
            Born and raised in Oregon, they bring decades of local expertise and a genuine 
            passion for hospitality to every guest experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-icon-emerald/20 to-icon-teal/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-icon-emerald/30">
                <Home className="h-6 w-6 text-icon-emerald" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Expertise</h3>
                <p className="text-gray-700 leading-relaxed">
                  With deep roots in Oregon, Robert and Shelly know every hidden gem, 
                  local favorite, and must-see attraction in the region.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-icon-rose/20 to-icon-pink/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-icon-rose/30">
                <Heart className="h-6 w-6 text-icon-rose" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Passionate Hosts</h3>
                <p className="text-gray-700 leading-relaxed">
                  Their genuine love for Oregon and commitment to exceptional service 
                  ensures every guest feels welcomed and cared for.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-icon-amber/20 to-icon-orange/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-icon-amber/30">
                <Award className="h-6 w-6 text-icon-amber" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Focus</h3>
                <p className="text-gray-700 leading-relaxed">
                  Every property is carefully curated and maintained to the highest 
                  standards, ensuring memorable stays for all guests.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-icon-blue/20 to-icon-indigo/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-icon-blue/30">
                <Users className="h-6 w-6 text-icon-blue" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Values</h3>
                <p className="text-gray-700 leading-relaxed">
                  As a family-owned business, they understand the importance of 
                  creating spaces where families can connect and create lasting memories.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-8 border-l-4 border-primary">
          <div className="flex items-start space-x-4">
            <MapPin className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="text-lg italic text-gray-800 leading-relaxed mb-4">
                "We believe Oregon is one of the most beautiful places on earth, and we want 
                every guest to experience the magic we've felt living here our whole lives. 
                From the stunning coastline to the majestic mountains, we're here to help 
                you discover it all."
              </p>
              <p className="text-sm font-medium text-gray-600">— Robert & Shelly, Founders</p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-lg leading-relaxed text-gray-700 mb-8">
            With Moxie Vacation Rentals, you're not just booking a stay – you're gaining 
            local ambassadors who are passionate about sharing the very best of Oregon with you.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-6 bg-gradient-to-br from-gradient-from/30 to-gradient-accent-from/30 rounded-xl border border-gradient-from/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-gradient-accent-from bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">Oregon</div>
              <div className="text-sm text-gray-600 font-medium">Born & Raised</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gradient-accent-from/30 to-gradient-accent-to/30 rounded-xl border border-gradient-accent-from/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-2xl font-bold bg-gradient-to-r from-icon-emerald to-icon-teal bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">Local</div>
              <div className="text-sm text-gray-600 font-medium">Experts</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gradient-from/30 to-gradient-accent-from/30 rounded-xl border border-gradient-from/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-2xl font-bold bg-gradient-to-r from-icon-amber to-icon-orange bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">Quality</div>
              <div className="text-sm text-gray-600 font-medium">Focused</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gradient-accent-from/30 to-gradient-accent-to/30 rounded-xl border border-gradient-accent-from/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-2xl font-bold bg-gradient-to-r from-icon-rose to-icon-pink bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">Family</div>
              <div className="text-sm text-gray-600 font-medium">Owned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDescription;
