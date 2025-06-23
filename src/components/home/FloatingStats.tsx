
import React from 'react';
import { Star, MapPin, Heart, Shield } from 'lucide-react';

const FloatingStats = () => {
  return (
    <div className="relative w-full h-full">
      {/* Top Right - Testimonial Card */}
      <div className="absolute top-8 right-8 max-w-sm p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
          ))}
        </div>
        <p className="text-white text-sm leading-relaxed mb-4">
          "Absolutely perfect stay! The attention to detail was incredible."
        </p>
        <div className="text-accent text-sm font-medium">- Sarah M.</div>
      </div>

      {/* Center Right - 98% Satisfaction Card */}
      <div className="absolute top-1/2 -translate-y-1/2 right-8 w-64 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl hover:scale-105 transition-all duration-300">
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-2">98%</div>
          <div className="text-accent text-lg font-semibold mb-2">Satisfaction Rate</div>
          <div className="text-gray-300 text-sm">From over 500+ reviews</div>
        </div>
      </div>

      {/* Middle Right - Location Badge */}
      <div className="absolute top-1/2 translate-y-8 right-8 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl hover:scale-105 transition-all duration-300">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-accent" />
          <div>
            <div className="text-white font-semibold text-sm">Eugene</div>
            <div className="text-gray-300 text-xs">Oregon</div>
          </div>
        </div>
      </div>

      {/* Bottom Right - Feature Badges */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-3">
        {/* Guest Favorite Card */}
        <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-pink-400" />
            <div className="text-white text-sm font-medium">Guest Favorite</div>
          </div>
        </div>

        {/* Verified Safe Card */}
        <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-400" />
            <div className="text-white text-sm font-medium">Verified Safe</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingStats;
