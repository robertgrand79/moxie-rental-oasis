
import React from 'react';

const GabbyIntroduction = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20 hover:shadow-3xl transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center border-b border-gray-200 pb-8 mb-12">
          <h3 className="text-5xl font-bold text-gray-900 mb-4">Hey! I'm Gabby</h3>
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-gradient-from/30 to-gradient-accent-from/30 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <img 
                src="/lovable-uploads/4182cb55-74cc-4bf1-974c-fe715da83294.png"
                alt="Gabby with her son Theo"
                className="rounded-2xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
          
          <div className="space-y-8">
            <p className="text-2xl text-gray-800 font-medium leading-relaxed">
              I'm thrilled to be a part of the team managing Airbnb properties.
            </p>
            
            <div className="bg-gradient-to-r from-gradient-accent-from/20 to-gradient-accent-to/20 rounded-2xl p-8 border border-gradient-accent-from/30">
              <p className="text-lg text-gray-700 leading-relaxed">
                Having lived my whole life in Oregon, I've had the privilege of growing up with my Dad Robert, 
                Step-Mom Shelly, sister, and my three awesome bonus siblings, which has been quite the adventure!
              </p>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              I attended South Eugene High School, and these days, you'll often find me spending time with my son Theo. 
              <span className="font-semibold text-gradient-from"> I'm here to ensure your stay is absolutely perfect!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GabbyIntroduction;
