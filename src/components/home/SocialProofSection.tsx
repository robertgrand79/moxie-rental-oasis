
import React from 'react';
import { ShieldCheck, Gem, Star, Headset } from 'lucide-react';
import { useRatingMetrics } from '@/hooks/useRatingMetrics';

const SocialProofSection = () => {
  const { metrics, isLoading } = useRatingMetrics();

  const trustSignals = [
    {
      icon: ShieldCheck,
      label: 'Verified Properties',
      description: 'Professionally managed & inspected'
    },
    {
      icon: Gem,
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
      icon: Headset,
      label: '24/7 Support',
      description: 'Always here when you need us'
    }
  ];

  return (
    <section className="py-10 bg-background border-t border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {trustSignals.map((signal, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-full border border-border/60 bg-muted/40">
                {signal.isRating ? (
                  <Star className="h-5 w-5 fill-current text-icon-amber" strokeWidth={1.5} />
                ) : (
                  <signal.icon className="h-5 w-5 text-foreground/70" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm tracking-tight">
                  {signal.label}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {signal.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
