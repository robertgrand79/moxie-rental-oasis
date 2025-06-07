
import React from 'react';

const FamilyDescription = () => {
  return (
    <div className="space-y-8">
      <div className="text-center border-b border-gray-200 pb-6">
        <h4 className="text-3xl font-bold text-gray-900 mb-3">Meet the dynamic duo</h4>
        <div className="flex justify-center items-center gap-6 text-2xl font-semibold">
          <span className="text-primary">Robert</span>
          <span className="text-gray-400 text-lg">&</span>
          <span className="text-primary">Shelly</span>
        </div>
      </div>
      
      <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
        <p className="text-xl text-gray-800 font-medium">
          Meet the dynamic duo behind Moxie Vacation Rentals: Robert and Shelly. Hailing from Oregon, 
          they bring a perfect blend of expertise and passion to their premier vacation rental business.
        </p>
        
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-l-4 border-primary">
          <p className="italic text-gray-700">
            Together, their shared love for Oregon and commitment to exceptional service shine through 
            in Moxie Vacation Rentals, providing guests with a remarkable stay combining outdoor adventures, 
            culinary delights, and stylish accommodations.
          </p>
        </div>
        
        <p className="text-lg text-gray-700">
          With Moxie Vacation Rentals, you can expect nothing less than excellence. They are more than 
          just hosts; they are passionate ambassadors of Oregon, ensuring that each guest leaves with 
          unforgettable memories.
        </p>
      </div>
    </div>
  );
};

export default FamilyDescription;
