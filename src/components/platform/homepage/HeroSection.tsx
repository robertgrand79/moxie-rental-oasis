import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const channelLogos = [
  { name: 'Airbnb', color: '#FF5A5F' },
  { name: 'Vrbo', color: '#3D67FF' },
  { name: 'Booking.com', color: '#003580' },
  { name: 'Direct', color: '#2563eb' },
];

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-8">
          <span className="text-sm font-medium text-blue-700">
            The Modern PMS for Independent Hosts
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-fraunces text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          One dashboard.
          <br />
          <span className="text-blue-600">Every channel.</span>
          <br />
          Every guest.
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 font-dm-sans">
          Manage bookings from Airbnb, VRBO, and your own website. 
          Build your local brand. Let AI handle the rest.
        </p>

        {/* Channel logos */}
        <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
          {channelLogos.map((channel) => (
            <div
              key={channel.name}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: channel.color }}
              />
              <span className="text-sm font-medium text-gray-700">{channel.name}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth?tab=signup">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/features">
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-6 text-lg font-semibold rounded-full border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600"
            >
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Trust indicator */}
        <p className="mt-8 text-sm text-gray-500">
          No credit card required • Free 14-day trial • Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
