
import React from 'react';

const FamilyDescription = () => {
  return (
    <div className="space-y-10">
      <div className="text-center border-b border-gray-200 pb-8">
        <h3 className="text-4xl font-bold text-gray-900 mb-4">Meet the dynamic duo</h3>
        <div className="flex justify-center items-center gap-8 text-3xl font-semibold">
          <span className="text-gradient-from">Robert</span>
          <span className="text-gray-400 text-2xl">&</span>
          <span className="text-gradient-from">Shelly</span>
        </div>
        <div className="w-16 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mt-4"></div>
      </div>
      
      <div className="space-y-8 text-gray-700">
        <p className="text-xl text-gray-800 font-medium leading-relaxed">
          Meet the dynamic duo behind Moxie Vacation Rentals: Robert and Shelly. Hailing from Oregon, 
          they bring a perfect blend of expertise and passion to their premier vacation rental business.
        </p>
        
        <div className="bg-gradient-to-r from-gradient-accent-from/20 to-gradient-accent-to/20 rounded-2xl p-8 border border-gradient-accent-from/30">
          <p className="text-lg text-gray-700 leading-relaxed italic">
            Together, their shared love for Oregon and commitment to exceptional service shine through 
            in Moxie Vacation Rentals, providing guests with a remarkable stay combining outdoor adventures, 
            culinary delights, and stylish accommodations.
          </p>
        </div>
        
        <p className="text-lg text-gray-700 leading-relaxed">
          With Moxie Vacation Rentals, you can expect nothing less than excellence. They are more than 
          just hosts; they are passionate ambassadors of Oregon, ensuring that each guest leaves with 
          unforgettable memories.
        </p>
      </div>
    </div>
  );
};

export default FamilyDescription;
