
import React from 'react';
import { Shield, Award, Users, Star } from 'lucide-react';
import { useRatingMetrics } from '@/hooks/useRatingMetrics';

const SocialProofSection = () => {
  const { metrics, isLoading } = useRatingMetrics();

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
      icon: Star,
      label: metrics && !isLoading ? `${metrics.formattedRating} Rating` : '5.0 Rating',
      description: metrics && !isLoading ? metrics.reviewText : '90+ Reviews',
      isRating: true
    },
    {
      icon: Users,
      label: '24/7 Support',
      description: 'Always here when you need us'
    }
  ];

  return (
    <section className="py-8 bg-background border-t border-b border-border">
      <div className="container mx-auto px-4">
        {/* Trust Signals */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trustSignals.map((signal, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-3">
                {signal.isRating && metrics && !isLoading ? (
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star 
                        key={starIndex} 
                        className="h-3 w-3 fill-current text-icon-amber"
                      />
                    ))}
                  </div>
                ) : (
                  <signal.icon className="h-6 w-6" />
                )}
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-1">
                {signal.label}
              </h4>
              <p className="text-xs text-muted-foreground">
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
