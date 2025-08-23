
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TestimonialCard from '@/components/ui/testimonial-card';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6);
      
      if (error) throw error;
      return data as Testimonial[];
    }
  });

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

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">What Our Guests Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from travelers who've made Eugene their home away from home
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
            />
          ))}
        </div>

        {testimonials.length > 6 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground text-sm">
              Showing {testimonials.length} featured reviews
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
