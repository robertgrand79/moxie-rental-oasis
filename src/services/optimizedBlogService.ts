
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blogPost';
import { toast } from '@/hooks/use-toast';

const isNetworkError = (error: any): boolean => {
  return error?.message?.includes('Failed to fetch') || 
         error?.message?.includes('Network request failed') ||
         error?.name === 'NetworkError' ||
         error?.code === 'NETWORK_ERROR';
};

const handleServiceError = (operation: string, error: any, showToast = true) => {
  console.error(`❌ ${operation} error:`, error);
  
  let errorMessage = 'An unexpected error occurred';
  
  if (isNetworkError(error)) {
    errorMessage = 'Network connection error. Please check your internet connection.';
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  if (showToast) {
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    });
  }
  
  throw new Error(errorMessage);
};

// Lightweight blog post type for listings (without full content)
export interface BlogPostSummary {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  published_at: string | null;
  image_url?: string;
  tags: string[];
  slug: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PaginatedBlogResponse {
  posts: BlogPostSummary[];
  totalCount: number;
  hasMore: boolean;
}

export const optimizedBlogService = {
  // Fetch blog post summaries for listings (without full content)
  async fetchBlogPostSummaries(
    publishedOnly: boolean = false,
    page: number = 1,
    limit: number = 20,
    searchQuery?: string,
    category?: string
  ): Promise<PaginatedBlogResponse> {
    console.log('🔍 Fetching blog post summaries, page:', page, 'limit:', limit, 'publishedOnly:', publishedOnly);
    
    try {
      const offset = (page - 1) * limit;

      // Build optimized query - only select fields needed for listing
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
          created_by
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Server-side filtering
      if (publishedOnly) {
        query = query.eq('status', 'published');
      }

      if (searchQuery && searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      if (category && category !== 'all') {
        if (category === 'robert-shelly') {
          query = query.contains('tags', ["Robert & Shelly's Travels"]);
        } else {
          query = query.contains('tags', [category]);
        }
      }

      const startTime = Date.now();
      const { data, error, count } = await query;
      const endTime = Date.now();
      
      console.log(`⚡ Blog summaries query completed in ${endTime - startTime}ms`);

      if (error) {
        handleServiceError('Blog post summaries fetch', error, false);
        return { posts: [], totalCount: 0, hasMore: false };
      }

      const mappedPosts: BlogPostSummary[] = (data || []).map(post => ({
        ...post,
        status: post.status as 'published' | 'draft',
        tags: Array.isArray(post.tags) ? post.tags : []
      }));

      console.log('✅ Fetched blog post summaries:', mappedPosts.length, 'Total count:', count);
      
      return {
        posts: mappedPosts,
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit
      };
    } catch (error) {
      handleServiceError('Blog post summaries fetch', error, false);
      return { posts: [], totalCount: 0, hasMore: false };
    }
  },

  // Fetch full blog post by slug (only when needed)
  async fetchFullBlogPost(slug: string): Promise<BlogPost | null> {
    console.log('🔍 Fetching full blog post by slug:', slug);
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) {
        handleServiceError('Full blog post fetch', error);
        return null;
      }

      console.log('✅ Fetched full blog post:', data?.title || 'Not found');
      return data ? {
        ...data,
        status: data.status as 'published' | 'draft',
        tags: Array.isArray(data.tags) ? data.tags : []
      } : null;
    } catch (error) {
      handleServiceError('Full blog post fetch', error);
      return null;
    }
  },

  // Get blog post stats (for admin dashboard)
  async getBlogStats(): Promise<{ total: number; published: number; drafts: number }> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('status')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog stats:', error);
        return { total: 0, published: 0, drafts: 0 };
      }

      const total = data.length;
      const published = data.filter(post => post.status === 'published').length;
      const drafts = data.filter(post => post.status === 'draft').length;

      return { total, published, drafts };
    } catch (error) {
      console.error('Error in getBlogStats:', error);
      return { total: 0, published: 0, drafts: 0 };
    }
  }
};
