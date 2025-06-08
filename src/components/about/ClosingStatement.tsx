
import React from 'react';
import { Quote } from 'lucide-react';

const ClosingStatement = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20 hover:shadow-3xl transition-all duration-300 group">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Quote className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
        </div>
        
        <blockquote className="text-2xl text-gray-700 italic mb-8 leading-relaxed relative">
          <span className="text-4xl text-gradient-from absolute -top-4 -left-4 opacity-30">"</span>
          Immerse yourself in the wonders of Oregon and indulge in the comfort, style, and hospitality 
          that Moxie Vacation Rentals offers, guided by the expertise of our passionate team.
          <span className="text-4xl text-gradient-accent-from absolute -bottom-8 -right-4 opacity-30">"</span>
        </blockquote>
        
        <div className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from"></div>
            <p className="font-semibold text-gray-900 text-xl">The Moxie Family</p>
            <div className="w-12 h-1 bg-gradient-to-r from-gradient-accent-from to-gradient-accent-to"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosingStatement;
