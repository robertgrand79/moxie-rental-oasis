
import React from 'react';
import { Star, MapPin, Heart, Shield } from 'lucide-react';

const FloatingStats = () => {
  return (
    <div className="relative w-full h-full">
      {/* Top Row - Testimonial Card */}
      <div className="absolute top-12 right-4 max-w-sm p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
        <div className="flex items-center gap-2 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
          ))}
        </div>
        <p className="text-white text-sm leading-relaxed mb-3">
          "Absolutely perfect stay! The attention to detail was incredible."
        </p>
        <div className="text-accent text-sm font-medium">- Sarah M.</div>
      </div>

      {/* Middle Left - Location Badge */}
      <div className="absolute top-1/2 -translate-y-1/2 right-16 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl transform -rotate-1 hover:rotate-0 transition-transform duration-500 z-10">
        <div className="flex items-center gap-3">
          <MapPin className="w-7 h-7 text-accent" />
          <div>
            <div className="text-white font-semibold text-sm">Eugene</div>
            <div className="text-gray-300 text-xs">Oregon</div>
          </div>
        </div>
      </div>

      {/* Center Right - 98% Satisfaction Card */}
      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-72 h-40 bg-white/8 backdrop-blur-xl rounded-l-2xl border-l border-t border-b border-white/15 shadow-2xl">
        <div className="p-6 h-full flex flex-col justify-center items-start">
          <div className="text-3xl font-bold text-white mb-1">98%</div>
          <div className="text-accent text-base font-semibold mb-1">Satisfaction Rate</div>
          <div className="text-gray-300 text-xs">From over 500+ reviews</div>
        </div>
      </div>

      {/* Bottom Right - Feature Badges (Stacked Vertically) */}
      <div className="absolute bottom-16 right-4 space-y-3">
        {/* Guest Favorite Card */}
        <div className="p-3 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            <div className="text-white text-xs font-medium">Guest Favorite</div>
          </div>
        </div>

        {/* Verified Safe Card */}
        <div className="p-3 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 shadow-xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <div className="text-white text-xs font-medium">Verified Safe</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingStats;
