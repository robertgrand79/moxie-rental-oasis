import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blogPost';
import { toast } from '@/hooks/use-toast';

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
        console.error('❌ Error fetching blog posts:', error);
        throw error;
      }

      console.log('✅ Fetched blog posts:', data?.length || 0, 'posts');
      // Cast the status field to the correct type
      return (data || []).map(post => ({
        ...post,
        status: post.status as 'published' | 'draft'
      }));
    } catch (error) {
      console.error('💥 Error in fetchBlogPosts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blog posts.',
        variant: 'destructive'
      });
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
        console.error('❌ Error fetching blog post by slug:', error);
        throw error;
      }

      console.log('✅ Fetched blog post by slug:', data?.title || 'Not found');
      // Cast the status field to the correct type
      return data ? {
        ...data,
        status: data.status as 'published' | 'draft'
      } : null;
    } catch (error) {
      console.error('💥 Error in fetchBlogPostBySlug:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blog post.',
        variant: 'destructive'
      });
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
        console.error('❌ Error creating blog post:', error);
        toast({
          title: 'Error',
          description: `Failed to create blog post: ${error.message}`,
          variant: 'destructive'
        });
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
      console.error('💥 Error in createBlogPost:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blog post.',
        variant: 'destructive'
      });
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
        console.error('❌ Error updating blog post:', error);
        toast({
          title: 'Error',
          description: `Failed to update blog post: ${error.message}`,
          variant: 'destructive'
        });
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
      console.error('💥 Error in updateBlogPost:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog post.',
        variant: 'destructive'
      });
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
        console.error('❌ Error deleting blog post:', error);
        toast({
          title: 'Error',
          description: `Failed to delete blog post: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }

      console.log('✅ Deleted blog post');
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully!'
      });
      return true;
    } catch (error) {
      console.error('💥 Error in deleteBlogPost:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post.',
        variant: 'destructive'
      });
      return false;
    }
  }
};
