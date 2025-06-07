
import React from 'react';

const FamilyDescription = () => {
  return (
    <div>
      <div className="mb-8">
        <h4 className="text-2xl font-bold text-gray-900 mb-4">Meet the dynamic duo</h4>
        <div className="flex gap-4 text-xl font-semibold text-gray-800">
          <span>Robert</span>
          <span>&</span>
          <span>Shelly</span>
        </div>
      </div>
      
      <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
        <p>
          Meet the dynamic duo behind Moxie Vacation Rentals: Robert and Shelly. Hailing from Oregon, 
          they bring a perfect blend of expertise and passion to their premier vacation rental business.
        </p>
        <p>
          Together, their shared love for Oregon and commitment to exceptional service shine through 
          in Moxie Vacation Rentals, providing guests with a remarkable stay combining outdoor adventures, 
          culinary delights, and stylish accommodations.
        </p>
        <p>
          With Moxie Vacation Rentals, you can expect nothing less than excellence. They are more than 
          just hosts; they are passionate ambassadors of Oregon, ensuring that each guest leaves with 
          unforgettable memories.
        </p>
      </div>
    </div>
  );
};

export default FamilyDescription;
