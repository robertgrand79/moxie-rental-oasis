import React from 'react';
import { Calendar, MapPin, Settings } from 'lucide-react';

const pillars = [
  {
    icon: Calendar,
    number: '01',
    title: 'Book Everywhere',
    description: 'Sync calendars across Airbnb, VRBO, Booking.com, and your direct booking website. One unified inbox for all guest communication.',
    features: ['Multi-channel sync', 'Unified inbox', 'Smart pricing'],
    color: 'blue',
  },
  {
    icon: MapPin,
    number: '02',
    title: 'Become the Local Brand',
    description: 'Build your own direct booking website that ranks in Google. Showcase local experiences. Turn first-time guests into repeat customers.',
    features: ['SEO-optimized site', 'Local content hub', 'Guest loyalty'],
    color: 'green',
  },
  {
    icon: Settings,
    number: '03',
    title: 'Run Your Operation',
    description: 'Automate cleaning schedules, maintenance tasks, and team communication. Smart home integration for keyless entry.',
    features: ['Task automation', 'Team management', 'Smart locks'],
    color: 'purple',
  },
];

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    numberColor: 'text-blue-600',
    featureBg: 'bg-blue-100',
    featureText: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    numberColor: 'text-green-600',
    featureBg: 'bg-green-100',
    featureText: 'text-green-700',
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    numberColor: 'text-purple-600',
    featureBg: 'bg-purple-100',
    featureText: 'text-purple-700',
  },
};

const PillarsSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
            The Solution
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-fraunces">
            Three pillars of
            <br />
            <span className="text-blue-600">hospitality success</span>
          </h2>
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((pillar) => {
            const colors = colorClasses[pillar.color as keyof typeof colorClasses];
            return (
              <div
                key={pillar.number}
                className={`${colors.bg} rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300`}
              >
                {/* Number and icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-5xl font-bold ${colors.numberColor} opacity-20 font-fraunces`}>
                    {pillar.number}
                  </span>
                  <div className={`${colors.iconBg} p-4 rounded-2xl`}>
                    <pillar.icon className={`w-8 h-8 ${colors.iconColor}`} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-fraunces">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {pillar.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {pillar.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 ${colors.featureBg} ${colors.featureText} text-sm font-medium rounded-full`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;
