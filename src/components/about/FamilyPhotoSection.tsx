
import React from 'react';

const FamilyPhotoSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Family</h3>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/dfe77e53-d5e7-44f1-be6c-7fd801ecc7fa.png"
              alt="Robert and Shelly - Founders"
              className="rounded-lg shadow-sm w-full h-48 object-cover"
            />
            <p className="text-sm text-gray-600 text-center">Robert & Shelly - Founders</p>
          </div>
          
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/d1f71962-f44a-4556-b875-d05f2a8a537a.png"
              alt="Robert and Shelly at community event"
              className="rounded-lg shadow-sm w-full h-48 object-cover"
            />
            <p className="text-sm text-gray-600 text-center">Community Involvement</p>
          </div>
          
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/11aea8e1-1241-453f-bc09-d4c8c7394c8c.png"
              alt="Enjoying Oregon lifestyle"
              className="rounded-lg shadow-sm w-full h-48 object-cover"
            />
            <p className="text-sm text-gray-600 text-center">Oregon Lifestyle</p>
          </div>
        </div>
        
        <p className="text-gray-600 text-center italic">
          Robert and Shelly bring decades of Oregon expertise and genuine hospitality 
          to every guest experience, ensuring your stay feels like home.
        </p>
      </div>
    </div>
  );
};

export default FamilyPhotoSection;
