
import React from 'react';
import { Shield, Award, Users, Calendar } from 'lucide-react';

const SocialProofSection = () => {
  const trustSignals = [
    {
      icon: Shield,
      label: 'Verified Properties',
      description: 'All properties professionally managed'
    },
    {
      icon: Award,
      label: 'Superhost Status',
      description: 'Top-rated hospitality excellence'
    },
    {
      icon: Users,
      label: '500+ Happy Guests',
      description: 'Trusted by travelers worldwide'
    },
    {
      icon: Calendar,
      label: '24/7 Support',
      description: 'Always here when you need us'
    }
  ];

  return (
    <section className="py-8 bg-white border-t border-b border-gray-100">
      <div className="container mx-auto px-4">
        {/* Trust Signals */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trustSignals.map((signal, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-3">
                <signal.icon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {signal.label}
              </h4>
              <p className="text-xs text-gray-600">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
