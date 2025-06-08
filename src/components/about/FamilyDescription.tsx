
import React from 'react';

const FamilyDescription = () => {
  return (
    <div className="space-y-8">
      <div className="text-center border-b border-gradient-accent-from/30 pb-8">
        <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
          Meet the dynamic duo
        </h3>
        <div className="flex justify-center items-center gap-8 text-3xl font-semibold">
          <span className="bg-gradient-to-r from-gradient-from via-primary to-gradient-accent-from bg-clip-text text-transparent">
            Robert
          </span>
          <span className="text-muted-foreground text-2xl">&</span>
          <span className="bg-gradient-to-r from-gradient-accent-from via-primary to-gradient-from bg-clip-text text-transparent">
            Shelly
          </span>
        </div>
        <div className="w-20 h-1 bg-gradient-to-r from-gradient-from via-primary to-gradient-accent-from mx-auto mt-6 rounded-full"></div>
      </div>
      
      <div className="space-y-8 text-gray-700">
        <div className="relative">
          <p className="text-xl text-gray-800 font-medium leading-relaxed">
            Meet the dynamic duo behind Moxie Vacation Rentals: Robert and Shelly. Hailing from Oregon, 
            they bring a perfect blend of expertise and passion to their premier vacation rental business.
          </p>
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-gradient-from to-gradient-accent-from rounded-full opacity-30"></div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-gradient-accent-from/10 via-white to-gradient-accent-to/10 rounded-2xl p-8 border border-gradient-accent-from/20 shadow-lg">
          <p className="text-lg text-gray-700 leading-relaxed italic relative z-10">
            "Together, their shared love for Oregon and commitment to exceptional service shine through 
            in Moxie Vacation Rentals, providing guests with a remarkable stay combining outdoor adventures, 
            culinary delights, and stylish accommodations."
          </p>
          
          {/* Subtle background pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gradient-accent-from/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gradient-accent-to/20 to-transparent rounded-full -ml-12 -mb-12"></div>
        </div>
        
        <div className="relative">
          <p className="text-lg text-gray-700 leading-relaxed">
            With Moxie Vacation Rentals, you can expect nothing less than excellence. They are more than 
            just hosts; they are passionate ambassadors of Oregon, ensuring that each guest leaves with 
            unforgettable memories.
          </p>
          
          {/* Highlight accent */}
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-gradient-accent-from to-gradient-accent-to rounded-full opacity-30"></div>
        </div>

        {/* Story highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gradient-from/20 to-transparent border border-gradient-from/30">
            <div className="text-2xl font-bold text-primary mb-1">Oregon</div>
            <div className="text-sm text-muted-foreground">Born & Raised</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gradient-accent-from/20 to-transparent border border-gradient-accent-from/30">
            <div className="text-2xl font-bold text-primary mb-1">Adventure</div>
            <div className="text-sm text-muted-foreground">Loving Couple</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gradient-accent-to/20 to-transparent border border-gradient-accent-to/30">
            <div className="text-2xl font-bold text-primary mb-1">Excellence</div>
            <div className="text-sm text-muted-foreground">In Hospitality</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDescription;
