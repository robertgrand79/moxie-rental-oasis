
import React from 'react';
import { Star, MapPin, Heart, Shield } from 'lucide-react';

const FloatingStats = () => {
  return (
    <div className="relative w-full h-full">
      {/* Floating Testimonial Card */}
      <div className="absolute top-20 right-10 max-w-xs p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
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

      {/* Floating Location Badge */}
      <div className="absolute top-1/2 right-20 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-accent" />
          <div>
            <div className="text-white font-semibold">Eugene</div>
            <div className="text-gray-300 text-sm">Oregon</div>
          </div>
        </div>
      </div>

      {/* Floating Feature Cards */}
      <div className="absolute bottom-32 right-5 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-pink-400" />
          <div className="text-white text-sm font-medium">Guest Favorite</div>
        </div>
      </div>

      <div className="absolute bottom-20 right-32 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-green-400" />
          <div className="text-white text-sm font-medium">Verified Safe</div>
        </div>
      </div>

      {/* Large Glass Card */}
      <div className="absolute top-1/3 right-0 w-80 h-48 bg-white/5 backdrop-blur-xl rounded-l-3xl border-l border-t border-b border-white/10 shadow-2xl">
        <div className="p-8 h-full flex flex-col justify-center">
          <div className="text-4xl font-bold text-white mb-2">98%</div>
          <div className="text-accent text-lg font-semibold mb-1">Satisfaction Rate</div>
          <div className="text-gray-300 text-sm">From over 500+ reviews</div>
        </div>
      </div>
    </div>
  );
};

export default FloatingStats;
