
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Users, Calendar, Star, CheckCircle } from 'lucide-react';

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

  const achievements = [
    'Featured in Travel Oregon',
    'Eugene Chamber of Commerce Member',
    'Hospitality Excellence Award 2024',
    '4.9/5 Average Guest Rating'
  ];

  return (
    <section className="py-8 bg-white border-t border-b border-gray-100">
      <div className="container mx-auto px-4">
        {/* Trust Signals */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Achievements */}
        <div className="flex flex-wrap justify-center gap-3">
          {achievements.map((achievement, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs py-1 px-3 border-green-200 text-green-700 bg-green-50"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {achievement}
            </Badge>
          ))}
        </div>

        {/* Recent Activity Ticker */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="font-medium">Sarah from Portland just booked the Garden Cottage for next weekend</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
