
import React from 'react';

const GabbyIntroduction = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 mt-12 border border-white/20">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Hey! I'm Gabby</h3>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img 
              src="/lovable-uploads/57d73fd0-c9a0-4d79-bcef-e15c498e795c.png"
              alt="Gabby with her son Theo"
              className="rounded-2xl shadow-lg w-full h-auto object-cover"
            />
          </div>
          <div>
            <p className="text-lg text-gray-700 leading-relaxed">
              I'm thrilled to be a part of the team managing Airbnb properties. Having lived my whole life 
              in Oregon, I've had the privilege of growing up with my Dad Robert, Step-Mom Shelly, sister, 
              and my three awesome bonus siblings, which has been quite the adventure! I attended South Eugene 
              High School, and these days, you'll often find me spending time with my son Theo. I'm here to 
              ensure your stay is absolutely perfect!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GabbyIntroduction;
