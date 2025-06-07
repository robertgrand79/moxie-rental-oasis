
import React from 'react';

const HowItWorks = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
        How It Works
      </h2>
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div>
          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            1
          </div>
          <h3 className="text-xl font-semibold mb-2">Browse & Select</h3>
          <p className="text-gray-600">Choose from our curated collection of local experiences</p>
        </div>
        <div>
          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            2
          </div>
          <h3 className="text-xl font-semibold mb-2">Book & Confirm</h3>
          <p className="text-gray-600">Secure your spot with instant booking confirmation</p>
        </div>
        <div>
          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            3
          </div>
          <h3 className="text-xl font-semibold mb-2">Experience & Enjoy</h3>
          <p className="text-gray-600">Meet your guide and create unforgettable memories</p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
