
import { useState, useEffect, useCallback, useRef } from 'react';
import { optimizedBlogService, BlogPostSummary, PaginatedBlogResponse } from '@/services/optimizedBlogService';
import { toast } from '@/hooks/use-toast';

interface UseOptimizedBlogPostsOptions {
  publishedOnly?: boolean;
  pageSize?: number;
  searchQuery?: string;
  category?: string;
}

interface UseOptimizedBlogPostsResult {
  posts: BlogPostSummary[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refetch: () => void;
  isLoadingMore: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const useOptimizedBlogPosts = (options: UseOptimizedBlogPostsOptions = {}): UseOptimizedBlogPostsResult => {
  const {
    publishedOnly = true,
    pageSize = 12,
    searchQuery = '',
    category = 'all'
  } = options;

  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Use refs to prevent unnecessary re-renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  const fetchPosts = useCallback(async (page: number, append: boolean = false, attempt = 0) => {
    console.log(`🔄 useOptimizedBlogPosts - fetching page ${page}, append: ${append}, attempt: ${attempt + 1}`);
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    if (!append && attempt === 0) {
      if (!isInitialLoadRef.current) {
        setLoading(true);
      }
      setError(null);
    } else if (append && attempt === 0) {
      setIsLoadingMore(true);
    }

    try {
      const response: PaginatedBlogResponse = await optimizedBlogService.fetchBlogPostSummaries(
        publishedOnly,
        page,
        pageSize,
        searchQuery.trim() || undefined,
        category !== 'all' ? category : undefined
      );

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.log('📊 useOptimizedBlogPosts - received response:', response.posts.length, 'posts, hasMore:', response.hasMore);

      if (append) {
        setPosts(prev => [...prev, ...response.posts]);
      } else {
        setPosts(response.posts);
      }
      
      setHasMore(response.hasMore);
      setTotalCount(response.totalCount);
      setError(null);
      isInitialLoadRef.current = false;
    } catch (error) {
      // Ignore aborted requests
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error('❌ Error in useOptimizedBlogPosts fetchPosts:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if we should retry
      if (attempt < MAX_RETRIES && errorMessage.includes('Failed to fetch')) {
        console.log(`🔄 Retrying blog posts fetch in ${RETRY_DELAY}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        
        fetchTimeoutRef.current = setTimeout(() => {
          fetchPosts(page, append, attempt + 1);
        }, RETRY_DELAY * (attempt + 1));
        
        return;
      }
      
      // Max retries reached or non-network error
      setError(errorMessage);
      if (!append) {
        setPosts([]);
      }
      
      if (attempt >= MAX_RETRIES) {
        toast({
          title: 'Network Error',
          description: 'Unable to load blog posts after multiple attempts. Please check your connection.',
          variant: 'destructive'
        });
      }
    } finally {
      if (attempt === 0 || attempt >= MAX_RETRIES) {
        setLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [publishedOnly, pageSize, searchQuery, category]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPosts(nextPage, true);
    }
  }, [currentPage, hasMore, isLoadingMore, loading, fetchPosts]);

  const refetch = useCallback(() => {
    console.log('🔄 useOptimizedBlogPosts - refetching from start');
    optimizedBlogService.clearCache(); // Clear cache on manual refetch
    setCurrentPage(1);
    isInitialLoadRef.current = true;
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Reset to page 1 when search/category changes
  useEffect(() => {
    console.log('🔄 useOptimizedBlogPosts - search/category changed, resetting');
    setCurrentPage(1);
    isInitialLoadRef.current = true;
    fetchPosts(1, false);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchPosts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refetch,
    isLoadingMore,
  };
};
