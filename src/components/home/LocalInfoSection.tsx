
import React from 'react';
import { Mountain, Coffee, TreePine } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

const LocalInfoSection = () => {
  const { tenantId } = useTenant();

  const { data: settings } = useQuery({
    queryKey: ['local-info-settings', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['siteName', 'heroLocationText', 'description']);

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

  const siteName = settings?.siteName || 'Our Properties';
  const location = settings?.heroLocationText || 'Your Destination';

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="bg-card/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Content Side */}
            <div className="p-12 lg:p-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-8 leading-tight">
                Discover the 
                <span className="block bg-gradient-to-r from-gradient-from to-gradient-accent-from bg-clip-text text-transparent">
                  Heart of {location}
                </span>
              </h2>
              
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed mb-8">
                <p>
                  Immerse yourself in the vibrant local community—from charming neighborhoods 
                  and local coffee shops to exciting local attractions and cultural experiences.
                </p>
                <p>
                  Experience the best of local living with morning adventures, 
                  scenic tours, and nights out at popular local spots.
                </p>
              </div>

              <div className="bg-gradient-to-r from-gradient-from/10 to-gradient-accent-from/10 rounded-2xl p-6 border border-primary/20">
                <p className="font-semibold text-foreground text-xl">
                  {siteName} is your gateway to authentic local living.
                </p>
              </div>
            </div>

            {/* Visual Side */}
            <div className="bg-gradient-to-br from-muted to-muted-foreground/20 p-12 lg:p-16 flex items-center justify-center">
              <div className="text-center text-foreground">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col items-center group">
                    <Mountain className="h-12 w-12 mb-2 text-icon-emerald hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium">Explore</span>
                  </div>
                  <div className="flex flex-col items-center group">
                    <Coffee className="h-12 w-12 mb-2 text-icon-amber hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium">Relax</span>
                  </div>
                  <div className="flex flex-col items-center group">
                    <TreePine className="h-12 w-12 mb-2 text-icon-green hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-medium">Nature</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Local Living</h3>
                <p className="opacity-90 leading-relaxed">
                  Located in charming neighborhoods, offering authentic local experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalInfoSection;
