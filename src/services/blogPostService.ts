
import { supabase } from '@/integrations/supabase/client';
import { BlogPost, ContentType } from '@/types/blogPost';
import { toast } from '@/hooks/use-toast';

// Note: This service now accepts organizationId as a parameter for multi-tenant filtering

const isNetworkError = (error: any): boolean => {
  return error?.message?.includes('Failed to fetch') || 
         error?.message?.includes('Network request failed') ||
         error?.name === 'NetworkError' ||
         error?.code === 'NETWORK_ERROR' ||
         error?.message?.includes('network error') ||
         !navigator.onLine;
};

const handleServiceError = (operation: string, error: any, showToast = true) => {
  console.error(`❌ ${operation} error:`, error);
  
  let errorMessage = 'An unexpected error occurred';
  
  if (isNetworkError(error)) {
    errorMessage = 'Network connection error. Please check your internet connection and try again.';
  } else if (error?.message) {
    errorMessage = error.message;
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

// Helper function to safely cast metadata
const safeMetadataCast = (metadata: any): Record<string, any> => {
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    return metadata as Record<string, any>;
  }
  return {};
};

export const blogPostService = {
  async fetchBlogPosts(publishedOnly: boolean = false, organizationId?: string): Promise<BlogPost[]> {
    console.log('🔍 Fetching blog posts, publishedOnly:', publishedOnly, 'orgId:', organizationId);
    
    // Check network connectivity first
    if (!navigator.onLine) {
      console.warn('⚠️ No network connection detected');
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

      console.log('✅ Fetched blog posts:', data?.length || 0, 'posts');
      
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
        console.warn('⚠️ Network error fetching blog posts, returning empty array');
        return [];
      }
      handleServiceError('Blog posts fetch', error, false);
      return [];
    }
  },

  async fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    console.log('🔍 Fetching blog post by slug:', slug);
    
    if (!navigator.onLine) {
      console.warn('⚠️ No network connection detected');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published') // Only fetch published posts for public access
        .maybeSingle();

      if (error) {
        handleServiceError('Blog post by slug fetch', error);
        return null;
      }

      console.log('✅ Fetched blog post by slug:', data?.title || 'Not found');
      
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
        console.warn('⚠️ Network error fetching blog post by slug');
        return null;
      }
      handleServiceError('Blog post by slug fetch', error);
      return null;
    }
  },

  async createBlogPost(postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'created_by'>, userId: string): Promise<BlogPost | null> {
    console.log('📝 Creating blog post:', postData.title);
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...postData,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        handleServiceError('Blog post creation', error);
        return null;
      }

      console.log('✅ Created blog post:', data.title);
      
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
    console.log('📝 Updating blog post:', postId);
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        handleServiceError('Blog post update', error);
        return null;
      }

      console.log('✅ Updated blog post:', data.title);
      
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
    console.log('🗑️ Deleting blog post:', postId);
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        handleServiceError('Blog post deletion', error);
        return false;
      }

      console.log('✅ Deleted blog post');
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
    console.log('🗑️ Cleaning up old auto-saved drafts');
    
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

      console.log('✅ Cleaned up old auto-saved drafts');
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
