
import { supabase } from '@/integrations/supabase/client';
import { BlogPost, BlogPostDB } from '@/types/blogPost';
import { transformDbPost } from '@/utils/blogPostUtils';
import { toast } from '@/hooks/use-toast';

export const blogPostService = {
  async fetchBlogPosts(): Promise<BlogPost[]> {
    console.log('Fetching blog posts...');
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blog posts.',
        variant: 'destructive'
      });
      return [];
    }

    console.log('Fetched blog posts:', data);
    return (data || []).map(transformDbPost);
  },

  async createBlogPost(
    postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    userId: string
  ): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          ...postData,
          created_by: userId,
          published_at: postData.status === 'published' ? new Date().toISOString() : null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating blog post:', error);
        toast({
          title: 'Error',
          description: 'Failed to create blog post.',
          variant: 'destructive'
        });
        return null;
      }

      toast({
        title: 'Success',
        description: 'Blog post created successfully!'
      });
      
      return transformDbPost(data as BlogPostDB);
    } catch (error) {
      console.error('Error in createBlogPost:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blog post.',
        variant: 'destructive'
      });
      return null;
    }
  },

  async updateBlogPost(postId: string, postData: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const updateData = {
        ...postData,
        updated_at: new Date().toISOString()
      };

      // Set published_at if status changes to published
      if (postData.status === 'published' && !postData.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        console.error('Error updating blog post:', error);
        toast({
          title: 'Error',
          description: 'Failed to update blog post.',
          variant: 'destructive'
        });
        return null;
      }

      toast({
        title: 'Success',
        description: 'Blog post updated successfully!'
      });
      
      return transformDbPost(data as BlogPostDB);
    } catch (error) {
      console.error('Error in updateBlogPost:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog post.',
        variant: 'destructive'
      });
      return null;
    }
  },

  async deleteBlogPost(postId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting blog post:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete blog post.',
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Success',
        description: 'Blog post deleted successfully!'
      });
      return true;
    } catch (error) {
      console.error('Error in deleteBlogPost:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post.',
        variant: 'destructive'
      });
      return false;
    }
  }
};
