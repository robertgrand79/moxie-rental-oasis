import { supabase } from '@/integrations/supabase/client';
import { BlogPost, ContentType, BlogPostMetadata } from '@/types/blogPost';
import { toast } from '@/hooks/use-toast';
import { debug } from '@/utils/debug';
import type { Json } from '@/integrations/supabase/types';

// Note: This service now accepts organizationId as a parameter for multi-tenant filtering

const isNetworkError = (error: unknown): boolean => {
  const err = error as { message?: string; name?: string; code?: string } | null;
  return err?.message?.includes('Failed to fetch') || 
         err?.message?.includes('Network request failed') ||
         err?.name === 'NetworkError' ||
         err?.code === 'NETWORK_ERROR' ||
         err?.message?.includes('network error') ||
         !navigator.onLine;
};

const handleServiceError = (operation: string, error: unknown, showToast = true) => {
  const err = error as { message?: string } | null;
  debug.error(`${operation} error:`, error);
  
  let errorMessage = 'An unexpected error occurred';
  
  if (isNetworkError(error)) {
    errorMessage = 'Network connection error. Please check your internet connection and try again.';
  } else if (err?.message) {
    errorMessage = err.message;
  }
  
  if (showToast && !isNetworkError(error)) {
    // Only show toast for non-network errors to avoid spam
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    });
  }
  
  throw new Error(errorMessage);
};

// Helper function to safely cast metadata from DB Json to BlogPostMetadata
const safeMetadataCast = (metadata: Json | null): BlogPostMetadata => {
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    return metadata as unknown as BlogPostMetadata;
  }
  return {};
};

// Helper to convert BlogPostMetadata to Json for DB storage
const metadataToJson = (metadata: BlogPostMetadata | undefined): Json => {
  return (metadata ?? {}) as unknown as Json;
};

export const blogPostService = {
  async fetchBlogPosts(publishedOnly: boolean = false, organizationId?: string): Promise<BlogPost[]> {
    debug.blog('Fetching blog posts, publishedOnly:', publishedOnly, 'orgId:', organizationId);
    
    // Check network connectivity first
    if (!navigator.onLine) {
      debug.warn('No network connection detected');
      return [];
    }
    
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by organization if provided
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      // If publishedOnly is true, filter for published posts only
      if (publishedOnly) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;

      if (error) {
        handleServiceError('Blog posts fetch', error, false);
        return [];
      }

      debug.blog('Fetched blog posts:', data?.length || 0, 'posts');
      
      // Cast and transform the data with proper type safety
      return (data || []).map(post => ({
        ...post,
        status: post.status as 'published' | 'draft',
        content_type: (post.content_type as ContentType) || 'article',
        metadata: safeMetadataCast(post.metadata),
        display_order: post.display_order || 0,
        is_featured: post.is_featured || false,
        is_active: post.is_active !== false,
        tags: Array.isArray(post.tags) ? post.tags : []
      }));
    } catch (error) {
      if (isNetworkError(error)) {
        debug.warn('Network error fetching blog posts, returning empty array');
        return [];
      }
      handleServiceError('Blog posts fetch', error, false);
      return [];
    }
  },

  async fetchBlogPostBySlug(slug: string, publishedOnly: boolean = true): Promise<BlogPost | null> {
    debug.blog('Fetching blog post by slug:', slug, 'publishedOnly:', publishedOnly);
    
    if (!navigator.onLine) {
      debug.warn('No network connection detected');
      return null;
    }
    
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug);
      
      // Only filter by published status for public access
      if (publishedOnly) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        handleServiceError('Blog post by slug fetch', error);
        return null;
      }

      debug.blog('Fetched blog post by slug:', data?.title || 'Not found');
      
      // Transform with proper type safety
      return data ? {
        ...data,
        status: data.status as 'published' | 'draft',
        content_type: (data.content_type as ContentType) || 'article',
        metadata: safeMetadataCast(data.metadata),
        display_order: data.display_order || 0,
        is_featured: data.is_featured || false,
        is_active: data.is_active !== false,
        tags: Array.isArray(data.tags) ? data.tags : []
      } : null;
    } catch (error) {
      if (isNetworkError(error)) {
        debug.warn('Network error fetching blog post by slug');
        return null;
      }
      handleServiceError('Blog post by slug fetch', error);
      return null;
    }
  },

  async createBlogPost(postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'created_by'>, userId: string): Promise<BlogPost | null> {
    debug.blog('Creating blog post:', postData.title);
    
    try {
      // Convert metadata for DB storage
      const dbData = {
        ...postData,
        metadata: metadataToJson(postData.metadata),
        created_by: userId
      };
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        handleServiceError('Blog post creation', error);
        return null;
      }

      debug.blog('Created blog post:', data.title);
      
      // Only show toast for published posts or manual saves
      if (postData.status === 'published') {
        toast({
          title: 'Success',
          description: 'Blog post published successfully!'
        });
      }
      
      // Transform with proper type safety
      return {
        ...data,
        status: data.status as 'published' | 'draft',
        content_type: (data.content_type as ContentType) || 'article',
        metadata: safeMetadataCast(data.metadata),
        display_order: data.display_order || 0,
        is_featured: data.is_featured || false,
        is_active: data.is_active !== false,
        tags: Array.isArray(data.tags) ? data.tags : []
      };
    } catch (error) {
      handleServiceError('Blog post creation', error);
      return null;
    }
  },

  async updateBlogPost(postId: string, postData: Partial<BlogPost>): Promise<BlogPost | null> {
    debug.blog('Updating blog post:', postId);
    
    try {
      // Convert metadata for DB storage - always convert to ensure compatibility
      const { metadata, ...rest } = postData;
      const dbData = metadata !== undefined
        ? { ...rest, metadata: metadataToJson(metadata) }
        : rest;
      
      const { data, error } = await supabase
        .from('blog_posts')
        .update(dbData)
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        handleServiceError('Blog post update', error);
        return null;
      }

      debug.blog('Updated blog post:', data.title);
      
      // Only show toast for published posts or manual saves
      if (postData.status === 'published') {
        toast({
          title: 'Success',
          description: 'Blog post updated successfully!'
        });
      }
      
      // Transform with proper type safety
      return {
        ...data,
        status: data.status as 'published' | 'draft',
        content_type: (data.content_type as ContentType) || 'article',
        metadata: safeMetadataCast(data.metadata),
        display_order: data.display_order || 0,
        is_featured: data.is_featured || false,
        is_active: data.is_active !== false,
        tags: Array.isArray(data.tags) ? data.tags : []
      };
    } catch (error) {
      handleServiceError('Blog post update', error);
      return null;
    }
  },

  async deleteBlogPost(postId: string): Promise<boolean> {
    debug.blog('Deleting blog post:', postId);
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        handleServiceError('Blog post deletion', error);
        return false;
      }

      debug.blog('Deleted blog post');
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully!'
      });
      return true;
    } catch (error) {
      handleServiceError('Blog post deletion', error);
      return false;
    }
  },

  async deleteOldAutoSavedDrafts(olderThanDays: number = 7): Promise<boolean> {
    debug.blog('Cleaning up old auto-saved drafts');
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('status', 'draft')
        .like('title', '%Untitled Draft%')
        .lt('updated_at', cutoffDate.toISOString());

      if (error) {
        handleServiceError('Auto-saved drafts cleanup', error);
        return false;
      }

      debug.blog('Cleaned up old auto-saved drafts');
      toast({
        title: 'Success',
        description: 'Old auto-saved drafts cleaned up successfully!'
      });
      return true;
    } catch (error) {
      handleServiceError('Auto-saved drafts cleanup', error);
      return false;
    }
  }
};
