
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blogPost';
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
      setLoading(true);
      setError(null);

      const offset = (page - 1) * POSTS_PER_PAGE;

      // Optimize query by selecting only essential fields for listing
      const selectFields = publishedOnly 
        ? 'id, title, excerpt, author, image_url, slug, status, published_at, created_at, updated_at'
        : 'id, title, excerpt, author, image_url, slug, status, published_at, created_at, updated_at, created_by';

      let query = supabase
        .from('blog_posts')
        .select(selectFields, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (publishedOnly) {
        query = query.eq('status', 'published');
      }

      const startTime = Date.now();
      const { data, error: fetchError, count } = await query;
      const endTime = Date.now();
      
      console.log(`⚡ usePaginatedBlogPosts - Query completed in ${endTime - startTime}ms`);

      if (fetchError) {
        console.error('❌ Error fetching blog posts:', fetchError);
        setError(fetchError.message);
        toast({
          title: 'Error',
          description: 'Failed to fetch blog posts',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ usePaginatedBlogPosts - Fetched posts:', data?.length || 0, 'Total count:', count);
      
      // Map data with proper typing but don't fetch full content for listing
      setPosts((data || []).map(post => ({
        ...post,
        status: post.status as 'published' | 'draft',
        content: '' // Don't load full content for listing performance
      })));
      setTotalCount(count || 0);
    } catch (err) {
      console.error('❌ Error in fetchPosts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
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
