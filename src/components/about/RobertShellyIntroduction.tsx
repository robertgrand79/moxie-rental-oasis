
import React from 'react';

const RobertShellyIntroduction = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20 hover:shadow-3xl transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center border-b border-gray-200 pb-8 mb-12">
          <h3 className="text-5xl font-bold text-gray-900 mb-4">Meet Robert & Shelly</h3>
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-gradient-from/30 to-gradient-accent-from/30 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <img 
                src="/lovable-uploads/dfe77e53-d5e7-44f1-be6c-7fd801ecc7fa.png"
                alt="Robert and Shelly - Founders of Moxie Vacation Rentals"
                className="rounded-2xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
          
          <div className="space-y-8">
            <p className="text-2xl text-gray-800 font-medium leading-relaxed">
              We're thrilled to welcome you to Moxie Vacation Rentals, where Oregon hospitality meets exceptional service.
            </p>
            
            <div className="bg-gradient-to-r from-gradient-accent-from/20 to-gradient-accent-to/20 rounded-2xl p-8 border border-gradient-accent-from/30">
              <p className="text-lg text-gray-700 leading-relaxed">
                As lifelong Oregon residents, we've spent decades exploring every corner of this beautiful state. 
                From the rugged coastline to the majestic Cascade Mountains, we know the hidden gems and local favorites 
                that make Oregon truly special.
              </p>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              Our passion for hospitality and love for our home state drove us to create Moxie Vacation Rentals. 
              <span className="font-semibold text-gradient-from"> We're here to ensure your Oregon experience is absolutely unforgettable!</span>
            </p>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">30+</div>
                <div className="text-sm text-gray-600">Years in Oregon</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-gray-600">Local Expertise</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5★</div>
                <div className="text-sm text-gray-600">Guest Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobertShellyIntroduction;
