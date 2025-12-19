import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

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
  const { organization } = useCurrentOrganization();
  const organizationId = organization?.id;

  return useQuery({
    queryKey: ['dashboard-stats', organizationId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!organizationId) {
        // Return empty stats if no organization
        return {
          properties: { total: 0 },
          blogPosts: { total: 0, published: 0 },
          pointsOfInterest: { total: 0, featured: 0 },
          galleryItems: { total: 0, featured: 0 },
          testimonials: { total: 0, featured: 0 },
          subscriberCount: 0,
          recentBlogPosts: []
        };
      }

      // First get properties for this organization to filter testimonials
      const { data: orgProperties } = await supabase
        .from('properties')
        .select('id')
        .eq('organization_id', organizationId);
      
      const propertyIds = orgProperties?.map(p => p.id) || [];

      // Run all COUNT queries in parallel - filtered by organization_id where available
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
        // Properties count - filtered by organization
        supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        // Blog posts total - filtered by organization
        supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        // Blog posts published - filtered by organization
        supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'published'),
        // Places total (formerly points_of_interest) - filtered by organization
        supabase
          .from('places')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        // Places featured - filtered by organization
        supabase
          .from('places')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('is_featured', true),
        // Gallery items total - filtered by organization
        supabase
          .from('lifestyle_gallery')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        // Gallery items featured - filtered by organization
        supabase
          .from('lifestyle_gallery')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('is_featured', true),
        // Testimonials total - filter by property_id (linked to org properties)
        propertyIds.length > 0
          ? supabase
              .from('testimonials')
              .select('*', { count: 'exact', head: true })
              .in('property_id', propertyIds)
          : Promise.resolve({ count: 0 }),
        // Testimonials featured - filter by property_id
        propertyIds.length > 0
          ? supabase
              .from('testimonials')
              .select('*', { count: 'exact', head: true })
              .in('property_id', propertyIds)
              .eq('is_featured', true)
          : Promise.resolve({ count: 0 }),
        // Newsletter subscribers - global for now
        supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('email_opt_in', true),
        // Recent blog posts - filtered by organization
        supabase
          .from('blog_posts')
          .select('id, title, status, created_at')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(5)
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
    enabled: !!organizationId, // Only run query when we have an organization
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });
};
