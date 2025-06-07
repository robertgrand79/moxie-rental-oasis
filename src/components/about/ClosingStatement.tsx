
import React from 'react';

const ClosingStatement = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20 hover:shadow-3xl transition-all duration-300">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
        </div>
        
        <blockquote className="text-2xl text-gray-700 italic mb-8 leading-relaxed">
          "Immerse yourself in the wonders of Oregon and indulge in the comfort, style, and hospitality 
          that Moxie Vacation Rentals offers, guided by the expertise of our passionate team."
        </blockquote>
        
        <div className="border-t border-gray-200 pt-8">
          <p className="font-semibold text-gray-900 text-xl">— The Moxie Family</p>
        </div>
      </div>
    </div>
  );
};

export default ClosingStatement;
