
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BlogPost } from '@/types/blogPost';
import { blogPostService } from '@/services/blogPostService';
import { toast } from '@/hooks/use-toast';

export { BlogPost } from '@/types/blogPost';

export const useBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const posts = await blogPostService.fetchBlogPosts();
      setBlogPosts(posts);
    } catch (error) {
      console.error('Error in fetchBlogPosts:', error);
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

    const newPost = await blogPostService.createBlogPost(postData, user.id);
    if (newPost) {
      setBlogPosts(prev => [newPost, ...prev]);
    }
    return newPost;
  };

  const updateBlogPost = async (postId: string, postData: Partial<BlogPost>): Promise<BlogPost | null> => {
    const updatedPost = await blogPostService.updateBlogPost(postId, postData);
    if (updatedPost) {
      setBlogPosts(prev => prev.map(post => 
        post.id === postId ? updatedPost : post
      ));
    }
    return updatedPost;
  };

  const deleteBlogPost = async (postId: string) => {
    const success = await blogPostService.deleteBlogPost(postId);
    if (success) {
      setBlogPosts(prev => prev.filter(post => post.id !== postId));
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
