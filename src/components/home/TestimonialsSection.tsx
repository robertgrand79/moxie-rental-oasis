
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TestimonialCard from '@/components/ui/testimonial-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { useTenant } from '@/contexts/TenantContext';
import { debug } from '@/utils/debug';

interface Testimonial {
  id: string;
  guest_name: string;
  guest_location?: string;
  guest_avatar_url?: string;
  rating: number;
  content?: string;
  review_text?: string;
  property_name?: string;
  stay_date?: string;
  booking_platform?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

const TestimonialsSection = () => {
  const [page, setPage] = useState(0);
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 6;
  const { settings } = useTenantSettings();
  const { tenantId } = useTenant();

  const sectionDescription = settings.testimonialsSectionDescription || 
    'Real experiences from travelers who\'ve stayed with us';

  const { data: testimonialResult, isLoading, isFetching } = useQuery({
    queryKey: ['testimonials-featured', page, tenantId],
    queryFn: async () => {
      if (!tenantId) {
        debug.log('[Testimonials]', '⭐ No tenantId, returning empty');
        return { data: [], count: 0 };
      }
      
      debug.log('[Testimonials]', '⭐ Fetching for org:', tenantId);
      
      // Step 1: Get property IDs for this tenant
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('organization_id', tenantId);
      
      const propertyIds = properties?.map(p => p.id) || [];
      debug.log('[Testimonials]', '⭐ Found', propertyIds.length, 'properties');
      
      if (propertyIds.length === 0) {
        return { data: [], count: 0 };
      }
      
      // Step 2: Fetch testimonials for those properties
      const { data, error, count } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact' })
        .in('property_id', propertyIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        console.error('⭐ [Testimonials] Error:', error.message);
        throw error;
      }
      
      debug.log('[Testimonials]', '⭐ Loaded', data?.length ?? 0, 'reviews (total:', count, ')');
      return { data: data as Testimonial[], count: count || 0 };
    },
    enabled: !!tenantId
  });

  useEffect(() => {
    if (testimonialResult) {
      const totalItems = testimonialResult.count || 0;
      const currentlyLoaded = (page + 1) * pageSize;
      setHasMore(currentlyLoaded < totalItems);

      if (page === 0) {
        setAllTestimonials(testimonialResult.data);
      } else {
        setAllTestimonials(prev => [...prev, ...testimonialResult.data]);
      }
    }
  }, [testimonialResult, page, pageSize]);

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (!isLoading && allTestimonials.length === 0) {
    return null;
  }

  const displayTestimonials = allTestimonials.length > 0 ? allTestimonials : (testimonialResult?.data || []);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">What Our Guests Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {sectionDescription}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {displayTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
            />
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMore}
              disabled={isFetching}
              variant="outline"
              size="lg"
              className="min-w-32"
            >
              {isFetching ? 'Loading...' : 'Load More Reviews'}
            </Button>
          </div>
        )}

        {displayTestimonials.length > 0 && (
          <div className="text-center mt-4">
            <p className="text-muted-foreground text-sm">
              Showing {displayTestimonials.length} reviews
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
