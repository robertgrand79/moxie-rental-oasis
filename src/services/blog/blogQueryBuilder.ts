
import { supabase } from '@/integrations/supabase/client';

export class BlogQueryBuilder {
  static buildSummariesQuery(
    publishedOnly: boolean,
    page: number,
    limit: number,
    searchQuery?: string,
    category?: string,
    organizationId?: string
  ) {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        excerpt,
        author,
        published_at,
        image_url,
        tags,
        slug,
        status,
        created_at,
        updated_at,
        created_by,
        organization_id
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    // Filter by organization if provided
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    // Apply filters first for better query optimization
    if (publishedOnly) {
      query = query.eq('status', 'published');
    }

    if (searchQuery && searchQuery.trim()) {
      query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
    }

    if (category && category !== 'all') {
      // Filter by tag - categories map directly to tags
      query = query.contains('tags', [category]);
    }

    // Always order by created_at last for better index usage
    query = query.order('created_at', { ascending: false });

    return query;
  }

  static buildFullPostQuery(slug: string) {
    return supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
  }

  static buildStatsQuery(organizationId?: string) {
    let query = supabase
      .from('blog_posts')
      .select('status')
      .order('created_at', { ascending: false });
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    
    return query;
  }
}
