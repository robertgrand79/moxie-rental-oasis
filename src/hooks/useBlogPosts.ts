
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BlogPost } from '@/types/blogPost';
import { blogPostService } from '@/services/blogPostService';
import { toast } from '@/hooks/use-toast';

export type { BlogPost } from '@/types/blogPost';

interface UseBlogPostsOptions {
  publishedOnly?: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const useBlogPosts = (options: UseBlogPostsOptions = {}) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  
  // Default to publishedOnly=true for unauthenticated users, false for authenticated users
  const publishedOnly = options.publishedOnly ?? !user;

  const fetchBlogPosts = useCallback(async (attempt = 0) => {
    console.log(`🔄 useBlogPosts - fetching with publishedOnly: ${publishedOnly}, attempt: ${attempt + 1}`);
    
    if (attempt === 0) {
      setLoading(true);
      setError(null);
    }

    try {
      const posts = await blogPostService.fetchBlogPosts(publishedOnly);
      console.log('📊 useBlogPosts - received posts:', posts.length);
      setBlogPosts(posts);
      setRetryCount(0);
      setError(null);
    } catch (error) {
      console.error('❌ Error in useBlogPosts fetchBlogPosts:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if we should retry
      if (attempt < MAX_RETRIES && errorMessage.includes('Failed to fetch')) {
        console.log(`🔄 Retrying blog posts fetch in ${RETRY_DELAY}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        setRetryCount(attempt + 1);
        
        setTimeout(() => {
          fetchBlogPosts(attempt + 1);
        }, RETRY_DELAY * (attempt + 1)); // Exponential backoff
        
        return;
      }
      
      // Max retries reached or non-network error
      setError(errorMessage);
      setBlogPosts([]);
      
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
      }
    }
  }, [publishedOnly]);

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
      const newPost = await blogPostService.createBlogPost(postData, user.id);
      if (newPost) {
        setBlogPosts(prev => [newPost, ...prev]);
      }
      return newPost;
    } catch (error) {
      console.error('❌ Error creating blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create blog post. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateBlogPost = async (postId: string, postData: Partial<BlogPost>): Promise<BlogPost | null> => {
    try {
      const updatedPost = await blogPostService.updateBlogPost(postId, postData);
      if (updatedPost) {
        setBlogPosts(prev => prev.map(post => 
          post.id === postId ? updatedPost : post
        ));
      }
      return updatedPost;
    } catch (error) {
      console.error('❌ Error updating blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog post. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const deleteBlogPost = async (postId: string) => {
    try {
      const success = await blogPostService.deleteBlogPost(postId);
      if (success) {
        setBlogPosts(prev => prev.filter(post => post.id !== postId));
      }
      return success;
    } catch (error) {
      console.error('❌ Error deleting blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  return {
    blogPosts,
    loading,
    error,
    retryCount,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    refetch: () => fetchBlogPosts(0)
  };
};
