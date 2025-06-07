
import React from 'react';

const GabbyIntroduction = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20 hover:shadow-3xl transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center border-b border-gray-200 pb-6 mb-8">
          <h3 className="text-4xl font-bold text-gray-900 mb-3">Hey! I'm Gabby</h3>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <img 
                src="/lovable-uploads/57d73fd0-c9a0-4d79-bcef-e15c498e795c.png"
                alt="Gabby with her son Theo"
                className="rounded-2xl shadow-lg w-full h-auto object-cover"
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <p className="text-xl text-gray-800 font-medium leading-relaxed">
              I'm thrilled to be a part of the team managing Airbnb properties.
            </p>
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-l-4 border-primary">
              <p className="text-lg text-gray-700 leading-relaxed">
                Having lived my whole life in Oregon, I've had the privilege of growing up with my Dad Robert, 
                Step-Mom Shelly, sister, and my three awesome bonus siblings, which has been quite the adventure!
              </p>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              I attended South Eugene High School, and these days, you'll often find me spending time with my son Theo. 
              <span className="font-semibold text-primary"> I'm here to ensure your stay is absolutely perfect!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GabbyIntroduction;
