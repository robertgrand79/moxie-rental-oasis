import React from 'react';
import { Sparkles, BookOpen, MapPin, Cloud, Tv, QrCode, Timer } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Chat Assistant',
    description: 'Voice and text AI that knows your property and local area in 50+ languages'
  },
  {
    icon: BookOpen,
    title: 'Digital Guidebook',
    description: 'WiFi, house rules, check-in instructions—all on the big screen'
  },
  {
    icon: MapPin,
    title: 'Local Recommendations',
    description: 'Your curated restaurant picks and hidden gem attractions'
  },
  {
    icon: Cloud,
    title: 'Live Weather',
    description: 'Current conditions and 5-day forecast to help guests plan adventures'
  }
];

const TVAppSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
            Coming Soon
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Transform Your TV Into a 5-Star Concierge
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Give guests a hotel-like experience with an AI-powered TV app. Property info, 
            local recommendations, and 24/7 concierge—all from the comfort of the couch.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* TV Mockup */}
          <div className="relative">
            <div className="bg-gray-900 rounded-2xl p-3 shadow-2xl">
              {/* TV Screen */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg aspect-video relative overflow-hidden">
                {/* Screen Content */}
                <div className="absolute inset-0 p-6 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-blue-200 text-sm">Welcome to</p>
                      <h3 className="text-white text-2xl font-bold">Mountain View Cabin</h3>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2 text-white">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        <span className="text-xl font-semibold">72°F</span>
                      </div>
                      <p className="text-xs text-blue-100">Partly Cloudy</p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-3 mt-auto">
                    {[
                      { icon: BookOpen, label: 'Guidebook' },
                      { icon: MapPin, label: 'Explore' },
                      { icon: Sparkles, label: 'Ask Moxie' },
                      { icon: Cloud, label: 'Weather' }
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className={`bg-white/10 backdrop-blur rounded-lg p-3 text-center ${idx === 2 ? 'ring-2 ring-white' : ''}`}
                      >
                        <item.icon className="h-6 w-6 text-white mx-auto mb-1" />
                        <span className="text-white text-xs">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Navigation Hint */}
                  <p className="text-blue-200 text-xs text-center mt-4">
                    Use ◀ ▶ to navigate • Press OK to select
                  </p>
                </div>
              </div>
            </div>
            {/* TV Stand */}
            <div className="flex justify-center mt-2">
              <div className="w-32 h-3 bg-gray-800 rounded-b-lg"></div>
            </div>
            <div className="flex justify-center">
              <div className="w-48 h-2 bg-gray-700 rounded-b-lg"></div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Callouts */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-5">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Tv className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Universal Compatibility</h4>
              <p className="text-sm text-gray-600">Works on Google TV, Fire TV, Roku & more</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-5">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Instant Setup</h4>
              <p className="text-sm text-gray-600">QR code pairing in under 60 seconds</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-5">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Timer className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Digital Signage Mode</h4>
              <p className="text-sm text-gray-600">Beautiful displays when guests aren't interacting</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TVAppSection;
