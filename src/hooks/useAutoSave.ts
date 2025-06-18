
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { blogPostService } from '@/services/blogPostService';
import { BlogPost } from '@/types/blogPost';
import { toast } from '@/hooks/use-toast';

interface AutoSaveData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  author: string;
  image_url?: string;
}

interface UseAutoSaveOptions {
  data: AutoSaveData;
  postId?: string;
  onAutoSave?: (savedPost: BlogPost) => void;
  delay?: number;
}

export const useAutoSave = ({ 
  data, 
  postId, 
  onAutoSave, 
  delay = 3000 
}: UseAutoSaveOptions) => {
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  const autoSave = useCallback(async () => {
    if (!user || !data.title.trim()) return;

    try {
      const postData = {
        title: data.title || 'Untitled Draft',
        excerpt: data.excerpt,
        content: data.content,
        image_url: data.image_url || null,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: 'draft' as const,
        author: data.author || 'Admin',
        published_at: null,
        slug: (data.title || 'untitled-draft').toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .slice(0, 50) + '-' + Date.now()
      };

      let savedPost: BlogPost | null;
      
      if (postId) {
        savedPost = await blogPostService.updateBlogPost(postId, postData);
      } else {
        savedPost = await blogPostService.createBlogPost(postData, user.id);
      }

      if (savedPost && onAutoSave) {
        onAutoSave(savedPost);
      }

      console.log('✅ Auto-saved blog post');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }, [data, postId, user, onAutoSave]);

  useEffect(() => {
    // Don't auto-save on initial mount
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      lastSavedDataRef.current = JSON.stringify(data);
      return;
    }

    const currentDataString = JSON.stringify(data);
    
    // Only auto-save if data has actually changed
    if (currentDataString !== lastSavedDataRef.current) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(() => {
        autoSave();
        lastSavedDataRef.current = currentDataString;
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, autoSave, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { autoSave };
};
