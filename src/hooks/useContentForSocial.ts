import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export type ContentType = 'blog_post' | 'newsletter' | 'property' | 'point_of_interest' | 'lifestyle_gallery' | 'testimonial' | 'event';

export interface ContentItem {
  id: string;
  title: string;
}

export const contentTypeLabels: Record<ContentType, string> = {
  blog_post: 'Blog Post',
  newsletter: 'Newsletter',
  property: 'Property',
  point_of_interest: 'Point of Interest',
  lifestyle_gallery: 'Lifestyle Gallery',
  testimonial: 'Testimonial',
  event: 'Event',
};

export function useContentForSocial(contentType: ContentType | null) {
  const { organization } = useCurrentOrganization();

  return useQuery({
    queryKey: ['content-for-social', contentType, organization?.id],
    queryFn: async (): Promise<ContentItem[]> => {
      if (!contentType || !organization?.id) return [];

      let items: ContentItem[] = [];

      switch (contentType) {
        case 'blog_post': {
          const { data } = await supabase
            .from('blog_posts')
            .select('id, title')
            .eq('organization_id', organization.id)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(50);
          items = (data || []).map(d => ({ id: d.id, title: d.title }));
          break;
        }
        case 'newsletter': {
          const { data } = await supabase
            .from('newsletter_campaigns')
            .select('id, subject')
            .order('created_at', { ascending: false })
            .limit(50);
          items = (data || []).map(d => ({ id: d.id, title: d.subject }));
          break;
        }
        case 'property': {
          const { data } = await supabase
            .from('properties')
            .select('id, title')
            .eq('organization_id', organization.id)
            .order('title', { ascending: true });
          items = (data || []).map(d => ({ id: d.id, title: d.title }));
          break;
        }
        case 'point_of_interest': {
          const { data } = await supabase
            .from('points_of_interest')
            .select('id, name')
            .eq('organization_id', organization.id)
            .eq('is_active', true)
            .order('name', { ascending: true })
            .limit(50);
          items = (data || []).map(d => ({ id: d.id, title: d.name }));
          break;
        }
        case 'lifestyle_gallery': {
          const { data } = await supabase
            .from('lifestyle_gallery')
            .select('id, title')
            .eq('organization_id', organization.id)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(50);
          items = (data || []).map(d => ({ id: d.id, title: d.title }));
          break;
        }
        case 'testimonial': {
          const { data } = await supabase
            .from('testimonials')
            .select('id, guest_name, property_name')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(50);
          items = (data || []).map(d => ({ 
            id: d.id, 
            title: `${d.guest_name}${d.property_name ? ` - ${d.property_name}` : ''}`
          }));
          break;
        }
        case 'event': {
          const { data } = await supabase
            .from('eugene_events')
            .select('id, title')
            .eq('organization_id', organization.id)
            .eq('status', 'published')
            .order('event_date', { ascending: false })
            .limit(50);
          items = (data || []).map(d => ({ id: d.id, title: d.title }));
          break;
        }
      }

      return items;
    },
    enabled: !!contentType && !!organization?.id,
  });
}
