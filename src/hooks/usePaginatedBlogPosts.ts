
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost, ContentType } from '@/types/blogPost';
import { toast } from '@/hooks/use-toast';

interface UsePaginatedBlogPostsResult {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => void;
}

const POSTS_PER_PAGE = 20;
const REQUEST_TIMEOUT = 10000; // 10 seconds

export const usePaginatedBlogPosts = (publishedOnly: boolean = false): UsePaginatedBlogPostsResult => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const fetchPosts = async (page: number) => {
    try {
      console.log('🔄 usePaginatedBlogPosts - Fetching page:', page, 'publishedOnly:', publishedOnly);
      
      // Check network connectivity
      if (!navigator.onLine) {
        console.warn('⚠️ No network connection detected');
        setError('No network connection');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      const offset = (page - 1) * POSTS_PER_PAGE;

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, REQUEST_TIMEOUT);

      // Build query with proper field selection
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (publishedOnly) {
        query = query.eq('status', 'published');
      }

      const startTime = Date.now();
      const { data, error: fetchError, count } = await query;
      const endTime = Date.now();
      
      clearTimeout(timeoutId);
      console.log(`⚡ usePaginatedBlogPosts - Query completed in ${endTime - startTime}ms`);

      if (fetchError) {
        console.error('❌ Error fetching blog posts:', fetchError);
        setError(fetchError.message);
        
        // Only show toast for non-network errors
        if (!fetchError.message?.includes('Failed to fetch')) {
          toast({
            title: 'Error',
            description: 'Failed to fetch blog posts',
            variant: 'destructive',
          });
        }
        return;
      }

      console.log('✅ usePaginatedBlogPosts - Raw data received:', data?.length || 0, 'Total count:', count);
      
      // Debug: Log first few posts to see their structure
      if (data && data.length > 0) {
        console.log('📋 Sample post data:', data[0]);
        console.log('📋 Posts by content_type from raw data:', {
          article: data.filter(p => p.content_type === 'article').length,
          event: data.filter(p => p.content_type === 'event').length,
          poi: data.filter(p => p.content_type === 'poi').length,
          lifestyle: data.filter(p => p.content_type === 'lifestyle').length,
          undefined: data.filter(p => !p.content_type).length
        });
      }
      
      // Map data with proper typing and validation including new fields
      const mappedPosts: BlogPost[] = (data || [])
        .filter((post): post is any => post !== null && typeof post === 'object' && 'id' in post)
        .map(post => {
          // Safe metadata casting
          const safeMetadata = post.metadata && typeof post.metadata === 'object' && !Array.isArray(post.metadata) 
            ? post.metadata as Record<string, any>
            : {};

          const mappedPost: BlogPost = {
            id: post.id || '',
            title: post.title || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            author: post.author || '',
            image_url: post.image_url || undefined,
            image_credit: post.image_credit || undefined,
            slug: post.slug || '',
            status: (post.status === 'published' ? 'published' : 'draft') as 'published' | 'draft',
            published_at: post.published_at || null,
            created_at: post.created_at || '',
            updated_at: post.updated_at || '',
            created_by: post.created_by || '',
            tags: Array.isArray(post.tags) ? post.tags : [],
            // Add new unified content fields with defaults
            content_type: (post.content_type as ContentType) || 'article',
            metadata: safeMetadata,
            category: post.category || undefined,
            display_order: post.display_order || 0,
            is_featured: post.is_featured || false,
            is_active: post.is_active !== false, // Default to true if not set
            // Location fields
            location: post.location || undefined,
            latitude: post.latitude || undefined,
            longitude: post.longitude || undefined,
            address: post.address || undefined,
            // Event fields
            event_date: post.event_date || undefined,
            end_date: post.end_date || undefined,
            time_start: post.time_start || undefined,
            time_end: post.time_end || undefined,
            ticket_url: post.ticket_url || undefined,
            price_range: post.price_range || undefined,
            is_recurring: post.is_recurring || false,
            recurrence_pattern: post.recurrence_pattern || undefined,
            // POI fields
            rating: post.rating || undefined,
            phone: post.phone || undefined,
            website_url: post.website_url || undefined,
            // Lifestyle fields
            activity_type: post.activity_type || undefined
          };

          return mappedPost;
        });

      console.log('✅ usePaginatedBlogPosts - Mapped posts:', mappedPosts.length);
      console.log('📋 Posts by content_type after mapping:', {
        article: mappedPosts.filter(p => p.content_type === 'article').length,
        event: mappedPosts.filter(p => p.content_type === 'event').length,
        poi: mappedPosts.filter(p => p.content_type === 'poi').length,
        lifestyle: mappedPosts.filter(p => p.content_type === 'lifestyle').length
      });

      setPosts(mappedPosts);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('❌ Error in fetchPosts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Only show toast for non-network errors
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('aborted')) {
        toast({
          title: 'Error',
          description: 'Failed to load blog posts',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      console.log('📄 usePaginatedBlogPosts - Navigating to page:', page);
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const refetch = () => {
    console.log('🔄 usePaginatedBlogPosts - Refetching current page:', currentPage);
    fetchPosts(currentPage);
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, publishedOnly]);

  return {
    posts,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    refetch,
  };
};
