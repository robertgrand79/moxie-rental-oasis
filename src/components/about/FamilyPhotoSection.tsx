
import React from 'react';

const FamilyPhotoSection = () => {
  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Primary/Featured Image - Larger */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute -inset-3 bg-gradient-to-r from-gradient-from/40 to-gradient-accent-from/40 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-all duration-700 group-hover:duration-300"></div>
          <div className="relative">
            <img 
              src="/lovable-uploads/dfe77e53-d5e7-44f1-be6c-7fd801ecc7fa.png"
              alt="Robert and Shelly - Founders of Moxie Vacation Rentals"
              className="rounded-2xl shadow-2xl w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-sm rounded-xl p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="font-semibold text-lg">Robert & Shelly</h3>
              <p className="text-sm text-gray-200">Founders & Oregon Natives</p>
            </div>
          </div>
        </div>
        
        {/* Supporting Image - Smaller, Offset */}
        <div className="lg:col-span-1 relative group lg:mt-12">
          <div className="absolute -inset-2 bg-gradient-to-r from-gradient-accent-from/30 to-gradient-accent-to/30 rounded-2xl blur opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative">
            <img 
              src="/lovable-uploads/d1f71962-f44a-4556-b875-d05f2a8a537a.png"
              alt="Robert and Shelly at a community event"
              className="rounded-xl shadow-xl w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          </div>
        </div>
      </div>
      
      {/* Photo Caption/Description */}
      <div className="mt-8 text-center lg:text-left">
        <p className="text-gray-600 italic leading-relaxed">
          Robert and Shelly bring decades of Oregon expertise and genuine hospitality 
          to every guest experience, ensuring your stay feels like home.
        </p>
      </div>
    </div>
  );
};

export default FamilyPhotoSection;
