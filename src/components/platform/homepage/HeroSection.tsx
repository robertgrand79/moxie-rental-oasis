import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';

const channelLogos = [
  { name: 'Airbnb', color: '#FF5A5F' },
  { name: 'VRBO', color: '#3B5998' },
  { name: 'Booking.com', color: '#003580' },
  { name: 'Direct', color: '#2563eb' },
];

const HeroSection: React.FC = () => {
  const { isPlatformSite } = usePlatform();
  const basePath = isPlatformSite ? '' : '/platform';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full border border-blue-500/30 mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm text-blue-300 font-medium">
              The operating system for vacation rentals
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-fraunces leading-tight">
            One dashboard.
            <br />
            <span className="text-blue-400">Every channel.</span>
            <br />
            Every guest.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Stop juggling platforms. StayMoxie syncs your Airbnb, VRBO, and direct bookings 
            while AI handles guest questions 24/7. Build your brand, not your workload.
          </p>

          {/* Channel logos */}
          <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
            {channelLogos.map((channel) => (
              <div
                key={channel.name}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: channel.color }}
                />
                <span className="text-sm text-gray-300">{channel.name}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl"
            >
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg rounded-xl"
            >
              <Link to={`${basePath}/features`}>
                <Play className="mr-2 w-5 h-5" />
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Trust indicator */}
          <p className="text-sm text-gray-500">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
