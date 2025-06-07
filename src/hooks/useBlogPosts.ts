
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
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

export const useBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBlogPosts = async () => {
    console.log('Fetching blog posts...');
    setLoading(true);
    try {
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
        setBlogPosts([]);
      } else {
        console.log('Fetched blog posts:', data);
        setBlogPosts(data || []);
      }
    } catch (error) {
      console.error('Error in fetchBlogPosts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blog posts.',
        variant: 'destructive'
      });
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<BlogPost | null> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create blog posts.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          ...postData,
          created_by: user.id,
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

      setBlogPosts(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Blog post created successfully!'
      });
      
      return data;
    } catch (error) {
      console.error('Error in addBlogPost:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blog post.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateBlogPost = async (postId: string, postData: Partial<BlogPost>): Promise<BlogPost | null> => {
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

      setBlogPosts(prev => prev.map(post => 
        post.id === postId ? data : post
      ));
      toast({
        title: 'Success',
        description: 'Blog post updated successfully!'
      });
      
      return data;
    } catch (error) {
      console.error('Error in updateBlogPost:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog post.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const deleteBlogPost = async (postId: string) => {
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
        return;
      }

      setBlogPosts(prev => prev.filter(post => post.id !== postId));
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully!'
      });
    } catch (error) {
      console.error('Error in deleteBlogPost:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  return {
    blogPosts,
    loading,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    refetch: fetchBlogPosts
  };
};
