import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, FileText, Mail, Calendar, MapPin, LucideIcon } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';

const contentPillars: { name: string; icon: LucideIcon }[] = [
  { name: 'Blog', icon: FileText },
  { name: 'Newsletter', icon: Mail },
  { name: 'Events', icon: Calendar },
  { name: 'Local Guide', icon: MapPin },
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
              The local market platform for vacation rentals
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-fraunces leading-tight">
            Become the
            <br />
            <span className="text-blue-400">local expert.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Most direct booking sites fail because they're just a booking form. 
            StayMoxie helps you build a local content hub—blog, newsletter, events, 
            and guides—that drives SEO traffic and keeps guests coming back.
          </p>

          {/* Content pillars */}
          <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
            {contentPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.name}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg"
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">{pillar.name}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl"
            >
              <Link to="/platform/signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl"
            >
              <a href="#features">
                <Play className="mr-2 w-5 h-5" />
                See How It Works
              </a>
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
