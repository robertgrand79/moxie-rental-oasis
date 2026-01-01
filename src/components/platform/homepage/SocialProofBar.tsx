import React from 'react';
import { Building2, DollarSign, MessageSquare } from 'lucide-react';

const stats = [
  {
    icon: Building2,
    value: '500+',
    label: 'Properties Managed',
  },
  {
    icon: DollarSign,
    value: '$2M+',
    label: 'Direct Bookings Generated',
  },
  {
    icon: MessageSquare,
    value: '50K+',
    label: 'AI Guest Responses',
  },
];

const SocialProofBar: React.FC = () => {
  return (
    <section className="py-12 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <stat.icon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-fraunces">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
