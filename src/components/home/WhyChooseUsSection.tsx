
import React from 'react';
import { Shield, Heart, MapPin, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

const WhyChooseUsSection = () => {
  const { tenantId } = useTenant();

  const { data: settings } = useQuery({
    queryKey: ['why-choose-us-settings', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['siteName', 'heroLocationText']);

      if (tenantId) {
        query = query.eq('organization_id', tenantId);
      }

      const { data } = await query;
      return data?.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {} as Record<string, any>) || {};
    },
    staleTime: 5 * 60 * 1000,
  });

  const siteName = settings?.siteName || 'Us';
  const location = settings?.heroLocationText || 'your destination';

  const features = [
    {
      icon: Shield,
      title: "Trusted & Verified",
      description: "Every property is personally inspected and verified for quality, safety, and authenticity.",
      color: "text-icon-blue"
    },
    {
      icon: Heart,
      title: "Local Hospitality",
      description: `Local hosts who care about your experience and know ${location}'s hidden gems.`,
      color: "text-icon-rose"
    },
    {
      icon: MapPin,
      title: "Prime Locations",
      description: "Handpicked properties in the most walkable and desirable neighborhoods.",
      color: "text-icon-emerald"
    },
    {
      icon: Star,
      title: "Exceptional Experience",
      description: "Curated amenities and personal touches that make your stay memorable.",
      color: "text-icon-amber"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 border">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose {siteName}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're not just providing a place to stay—we're creating authentic local experiences
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gradient-from to-gradient-accent-from rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className={`h-8 w-8 ${feature.color} transition-colors duration-300`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
