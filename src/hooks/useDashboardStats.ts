import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  properties: { total: number };
  blogPosts: { total: number; published: number };
  pointsOfInterest: { total: number; featured: number };
  galleryItems: { total: number; featured: number };
  testimonials: { total: number; featured: number };
  subscriberCount: number;
  recentBlogPosts: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }>;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Run all COUNT queries in parallel - much more efficient than fetching full tables
      const [
        propertiesCount,
        blogPostsTotal,
        blogPostsPublished,
        poiTotal,
        poiFeatured,
        galleryTotal,
        galleryFeatured,
        testimonialsTotal,
        testimonialsFeatured,
        subscribersCount,
        recentPosts
      ] = await Promise.all([
        // Properties count
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        // Blog posts total
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        // Blog posts published
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        // Points of interest total
        supabase.from('points_of_interest').select('*', { count: 'exact', head: true }),
        // Points of interest featured
        supabase.from('points_of_interest').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        // Gallery items total
        supabase.from('lifestyle_gallery').select('*', { count: 'exact', head: true }),
        // Gallery items featured
        supabase.from('lifestyle_gallery').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        // Testimonials total
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        // Testimonials featured
        supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        // Newsletter subscribers
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('email_opt_in', true),
        // Recent blog posts (only fetch 5 with minimal fields)
        supabase.from('blog_posts').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      return {
        properties: { total: propertiesCount.count || 0 },
        blogPosts: { 
          total: blogPostsTotal.count || 0, 
          published: blogPostsPublished.count || 0 
        },
        pointsOfInterest: { 
          total: poiTotal.count || 0, 
          featured: poiFeatured.count || 0 
        },
        galleryItems: { 
          total: galleryTotal.count || 0, 
          featured: galleryFeatured.count || 0 
        },
        testimonials: { 
          total: testimonialsTotal.count || 0, 
          featured: testimonialsFeatured.count || 0 
        },
        subscriberCount: subscribersCount.count || 0,
        recentBlogPosts: recentPosts.data || []
      };
    },
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });
};
