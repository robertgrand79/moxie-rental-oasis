
import React from 'react';

const FamilyDescription = () => {
  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Meet Robert & Shelly
        </h3>
        <div className="w-16 h-1 bg-primary mx-auto md:mx-0 mb-6 rounded-full"></div>
      </div>
      
      <div className="space-y-6 text-gray-700">
        <p className="text-lg leading-relaxed">
          Meet the dynamic duo behind Moxie Vacation Rentals: Robert and Shelly. Hailing from Oregon, 
          they bring a perfect blend of expertise and passion to their premier vacation rental business.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-primary">
          <p className="text-lg italic text-gray-800 leading-relaxed">
            "Together, their shared love for Oregon and commitment to exceptional service shine through 
            in Moxie Vacation Rentals, providing guests with a remarkable stay combining outdoor adventures, 
            culinary delights, and stylish accommodations."
          </p>
        </div>
        
        <p className="text-lg leading-relaxed">
          With Moxie Vacation Rentals, you can expect nothing less than excellence. They are more than 
          just hosts; they are passionate ambassadors of Oregon, ensuring that each guest leaves with 
          unforgettable memories.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="text-center p-6 bg-gradient-to-br from-gradient-from/30 to-gradient-accent-from/30 rounded-xl border border-gradient-from/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-gradient-accent-from bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">Oregon</div>
            <div className="text-sm text-gray-600 font-medium">Born & Raised</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-gradient-accent-from/30 to-gradient-accent-to/30 rounded-xl border border-gradient-accent-from/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-icon-emerald to-icon-teal bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">Adventure</div>
            <div className="text-sm text-gray-600 font-medium">Loving Couple</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-gradient-from/30 to-gradient-accent-from/30 rounded-xl border border-gradient-from/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-icon-amber to-icon-orange bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">Excellence</div>
            <div className="text-sm text-gray-600 font-medium">In Hospitality</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDescription;
