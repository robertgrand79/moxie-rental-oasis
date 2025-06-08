
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BlogPost } from '@/types/blogPost';
import { blogPostService } from '@/services/blogPostService';
import { toast } from '@/hooks/use-toast';

export type { BlogPost } from '@/types/blogPost';

interface UseBlogPostsOptions {
  publishedOnly?: boolean;
}

export const useBlogPosts = (options: UseBlogPostsOptions = {}) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Default to publishedOnly=true for unauthenticated users, false for authenticated users
  const publishedOnly = options.publishedOnly ?? !user;

  const fetchBlogPosts = async () => {
    console.log('🔄 useBlogPosts - fetching with publishedOnly:', publishedOnly);
    setLoading(true);
    try {
      const posts = await blogPostService.fetchBlogPosts(publishedOnly);
      console.log('📊 useBlogPosts - received posts:', posts.length);
      setBlogPosts(posts);
    } catch (error) {
      console.error('❌ Error in useBlogPosts fetchBlogPosts:', error);
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
  }, [publishedOnly]); // Re-fetch when publishedOnly changes

  return {
    blogPosts,
    loading,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    refetch: fetchBlogPosts
  };
};
