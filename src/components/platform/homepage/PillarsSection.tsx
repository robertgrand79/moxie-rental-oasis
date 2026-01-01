import React from 'react';
import { MapPin, Globe, Settings } from 'lucide-react';

const pillars = [
  {
    icon: MapPin,
    number: '01',
    title: 'Become the Local Hub',
    description: 'Build a content-rich destination site that attracts travelers and keeps them coming back.',
    features: ['SEO-optimized blog', 'Email newsletters', 'Local events calendar', 'Places & guides directory'],
    color: 'green',
  },
  {
    icon: Globe,
    number: '02',
    title: 'Book Everywhere',
    description: 'Sync all your booking channels in real-time. Airbnb, VRBO, and direct—one calendar.',
    features: ['Full Airbnb & VRBO API integration', 'Direct booking website', 'Unified calendar', 'Instant availability updates'],
    color: 'blue',
  },
  {
    icon: Settings,
    number: '03',
    title: 'Automate Operations',
    description: 'Let AI handle guest questions while you manage reservations from one dashboard.',
    features: ['AI guest responses 24/7', 'Unified inbox', 'Task management', 'Team collaboration'],
    color: 'purple',
  },
];

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    numberColor: 'text-blue-600',
    featureBg: 'bg-blue-50',
    featureText: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    numberColor: 'text-green-600',
    featureBg: 'bg-green-50',
    featureText: 'text-green-700',
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    numberColor: 'text-purple-600',
    featureBg: 'bg-purple-50',
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
            The Three Pillars
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-fraunces">
            Content first. Bookings follow.
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Build a local brand that guests remember, then manage every booking channel from one place.
          </p>
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => {
            const colors = colorClasses[pillar.color as keyof typeof colorClasses];
            return (
              <div
                key={pillar.number}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Number and icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-4xl font-bold ${colors.numberColor} opacity-30 font-fraunces`}>
                    {pillar.number}
                  </span>
                  <div className={`p-3 ${colors.iconBg} rounded-xl`}>
                    <pillar.icon className={`w-6 h-6 ${colors.iconColor}`} />
                  </div>
                </div>

                {/* Title and description */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-fraunces">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {pillar.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {pillar.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.iconBg}`} />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;
