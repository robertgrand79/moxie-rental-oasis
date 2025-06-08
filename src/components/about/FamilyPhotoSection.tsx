
import React from 'react';

const FamilyPhotoSection = () => {
  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-gradient-from/30 to-gradient-accent-from/30 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <img 
              src="/lovable-uploads/dfe77e53-d5e7-44f1-be6c-7fd801ecc7fa.png"
              alt="Robert and Shelly"
              className="rounded-2xl shadow-xl w-full h-auto object-cover"
            />
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-gradient-from/30 to-gradient-accent-from/30 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <img 
              src="/lovable-uploads/d1f71962-f44a-4556-b875-d05f2a8a537a.png"
              alt="Robert and Shelly at an event"
              className="rounded-2xl shadow-xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyPhotoSection;
