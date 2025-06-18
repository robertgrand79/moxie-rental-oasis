
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

export const blogPostService = {
  async fetchBlogPosts(publishedOnly: boolean = false): Promise<BlogPost[]> {
    console.log('🔍 Fetching blog posts, publishedOnly:', publishedOnly);
    
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

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
      // Cast the status field to the correct type
      return (data || []).map(post => ({
        ...post,
        status: post.status as 'published' | 'draft'
      }));
    } catch (error) {
      handleServiceError('Blog posts fetch', error, false);
      return [];
    }
  },

  async fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    console.log('🔍 Fetching blog post by slug:', slug);
    
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
      // Cast the status field to the correct type
      return data ? {
        ...data,
        status: data.status as 'published' | 'draft'
      } : null;
    } catch (error) {
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
      toast({
        title: 'Success',
        description: 'Blog post created successfully!'
      });
      // Cast the status field to the correct type
      return {
        ...data,
        status: data.status as 'published' | 'draft'
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
      toast({
        title: 'Success',
        description: 'Blog post updated successfully!'
      });
      // Cast the status field to the correct type
      return {
        ...data,
        status: data.status as 'published' | 'draft'
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
  }
};
