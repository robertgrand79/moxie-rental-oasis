import React from 'react';
import { FileText, Mail, Calendar, MapPin } from 'lucide-react';

const contentPillars = [
  {
    icon: FileText,
    title: 'Blog for SEO',
    description: 'AI-assisted blog posts about local attractions, seasonal events, and travel tips. Rank for "vacation rentals in [your area]" and related searches.',
    highlight: 'Drives organic traffic',
  },
  {
    icon: Mail,
    title: 'Newsletter for Retention',
    description: 'Automated email campaigns to past guests. Share local updates, seasonal specials, and property news to turn one-time visitors into repeat bookers.',
    highlight: 'Brings guests back',
  },
  {
    icon: Calendar,
    title: 'Local Events Hub',
    description: 'Curated calendar of local festivals, markets, concerts, and activities. Guests visit your site to plan their trip—before they book anywhere.',
    highlight: 'Captures planning traffic',
  },
  {
    icon: MapPin,
    title: 'Places Directory',
    description: 'Your personal recommendations for restaurants, attractions, and hidden gems. Become the trusted local guide that guests remember and share.',
    highlight: 'Builds authority',
  },
];

const LocalBrandSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-200 uppercase tracking-wider">
            Your Content Machine
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-white font-fraunces">
            Four pillars that make
            <br />
            <span className="text-blue-200">direct booking sites work</span>
          </h2>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
            Most hosts set up a booking page and stop. StayMoxie gives you the content 
            engine that drives SEO traffic, builds guest relationships, and turns your 
            site into the go-to resource for your market.
          </p>
        </div>

        {/* Content pillars grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contentPillars.map((pillar, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <pillar.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white font-fraunces">
                      {pillar.title}
                    </h3>
                    <span className="text-xs font-medium text-blue-200 bg-blue-500/30 px-2 py-1 rounded-full">
                      {pillar.highlight}
                    </span>
                  </div>
                  <p className="text-blue-100 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats callout */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white font-fraunces">10x</div>
              <div className="text-blue-200 mt-2">More organic traffic with active blog</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white font-fraunces">3x</div>
              <div className="text-blue-200 mt-2">Higher repeat booking rate with newsletters</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white font-fraunces">40%</div>
              <div className="text-blue-200 mt-2">Of travelers research local events first</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalBrandSection;
