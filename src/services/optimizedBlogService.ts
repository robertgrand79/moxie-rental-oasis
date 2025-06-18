
import { BlogPost } from '@/types/blogPost';
import { blogCache } from './blog/blogCache';
import { handleBlogServiceError } from './blog/blogErrorHandler';
import { BlogQueryBuilder } from './blog/blogQueryBuilder';
import { transformToBlogPostSummary, transformToFullBlogPost } from './blog/blogTransforms';

// Re-export types for backward compatibility
export type { BlogPostSummary, PaginatedBlogResponse, BlogStats } from './blog/types';
import type { BlogPostSummary, PaginatedBlogResponse, BlogStats } from './blog/types';

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
    
    // Create cache key
    const cacheKey = blogCache.createKey({
      publishedOnly,
      page,
      limit,
      searchQuery: searchQuery || '',
      category: category || ''
    });
    
    // Return cached data if still valid
    const cached = blogCache.get<PaginatedBlogResponse>(cacheKey);
    if (cached) {
      console.log('📦 Returning cached blog posts');
      return cached;
    }
    
    try {
      const startTime = Date.now();
      const query = BlogQueryBuilder.buildSummariesQuery(
        publishedOnly,
        page,
        limit,
        searchQuery,
        category
      );
      
      const { data, error, count } = await query;
      const endTime = Date.now();
      
      console.log(`⚡ Blog summaries query completed in ${endTime - startTime}ms`);

      if (error) {
        console.error('Database error:', error);
        handleBlogServiceError('Blog post summaries fetch', error, false);
      }

      const mappedPosts: BlogPostSummary[] = (data || []).map(transformToBlogPostSummary);

      console.log('✅ Fetched blog post summaries:', mappedPosts.length, 'Total count:', count);
      
      const result: PaginatedBlogResponse = {
        posts: mappedPosts,
        totalCount: count || 0,
        hasMore: (count || 0) > ((page - 1) * limit) + limit
      };

      // Cache the result
      blogCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Service error:', error);
      handleBlogServiceError('Blog post summaries fetch', error, false);
    }
  },

  // Clear cache when needed
  clearCache() {
    blogCache.clear();
  },

  // Fetch full blog post by slug (only when needed)
  async fetchFullBlogPost(slug: string): Promise<BlogPost | null> {
    console.log('🔍 Fetching full blog post by slug:', slug);
    
    try {
      const { data, error } = await BlogQueryBuilder.buildFullPostQuery(slug);

      if (error) {
        handleBlogServiceError('Full blog post fetch', error);
      }

      console.log('✅ Fetched full blog post:', data?.title || 'Not found');
      return data ? transformToFullBlogPost(data) : null;
    } catch (error) {
      handleBlogServiceError('Full blog post fetch', error);
    }
  },

  // Get blog post stats (for admin dashboard)
  async getBlogStats(): Promise<BlogStats> {
    try {
      const { data, error } = await BlogQueryBuilder.buildStatsQuery();

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
