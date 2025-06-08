
import React from 'react';

const FamilyPhotoSection = () => {
  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gradient-from/20 to-gradient-accent-from/30 rounded-lg border border-gradient-from/20 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <p className="text-gray-600 font-medium">Moxie Vacation Rentals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyPhotoSection;
