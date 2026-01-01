import React from 'react';
import { Globe, Search, Users, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Your Own Booking Website',
    description: 'Professional, mobile-first website with your branding. Accept direct bookings with no OTA fees.',
  },
  {
    icon: Search,
    title: 'SEO That Works',
    description: 'Optimized for "vacation rentals in [your area]" searches. Get found by guests searching Google.',
  },
  {
    icon: Users,
    title: 'Local Content Hub',
    description: 'Blog about local events, restaurants, and hidden gems. Become the go-to resource for visitors.',
  },
  {
    icon: TrendingUp,
    title: 'Guest Retention',
    description: 'Build email lists, offer returning guest discounts, and turn one-time visitors into loyal customers.',
  },
];

const LocalBrandSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-200 uppercase tracking-wider">
            Direct Booking Engine
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-white font-fraunces">
            Stop paying 15% to OTAs
            <br />
            <span className="text-blue-200">Build your local brand</span>
          </h2>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
            Your properties deserve more than a listing. Build a destination brand that 
            guests remember and return to—without Airbnb taking the credit (or the fees).
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-fraunces">
                {feature.title}
              </h3>
              <p className="text-blue-100 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats callout */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white font-fraunces">15%</div>
              <div className="text-blue-200 mt-2">Average OTA commission you can save</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white font-fraunces">40%</div>
              <div className="text-blue-200 mt-2">Of guests prefer booking direct</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white font-fraunces">3x</div>
              <div className="text-blue-200 mt-2">Higher repeat booking rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalBrandSection;
