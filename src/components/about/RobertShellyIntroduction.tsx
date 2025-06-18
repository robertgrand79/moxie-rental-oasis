
import React from 'react';

const RobertShellyIntroduction = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <img 
              src="/lovable-uploads/dfe77e53-d5e7-44f1-be6c-7fd801ecc7fa.png"
              alt="Robert and Shelly - Founders of Moxie Vacation Rentals"
              className="rounded-lg shadow-sm w-full h-64 object-cover"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Robert & Shelly</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We're thrilled to welcome you to Moxie Vacation Rentals, where Oregon hospitality meets exceptional service.
              </p>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              As lifelong Oregon residents, we've spent decades exploring every corner of this beautiful state. 
              From the rugged coastline to the majestic Cascade Mountains, we know the hidden gems and local favorites 
              that make Oregon truly special.
            </p>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
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
