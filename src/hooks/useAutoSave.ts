
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { blogPostService } from '@/services/blogPostService';
import { BlogPost, ContentType } from '@/types/blogPost';
import { toast } from '@/hooks/use-toast';

interface AutoSaveData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  author: string;
  image_url?: string;
  image_credit?: string;
  organization_id?: string;
  // Content type fields
  content_type?: ContentType;
  category?: string;
  display_order?: number;
  is_featured?: boolean;
  is_active?: boolean;
  // Location fields
  location?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  // Event fields
  event_date?: string;
  end_date?: string;
  time_start?: string;
  time_end?: string;
  ticket_url?: string;
  price_range?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  // POI fields
  rating?: number;
  phone?: string;
  website_url?: string;
  // Lifestyle fields
  activity_type?: string;
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
        image_credit: data.image_credit || null,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: 'draft' as const,
        author: data.author || 'Admin',
        published_at: null,
        organization_id: data.organization_id || null,
        slug: (data.title || 'untitled-draft').toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .slice(0, 50) + '-' + Date.now(),
        // Content type fields with defaults
        content_type: data.content_type || 'article' as const,
        category: data.category || null,
        display_order: data.display_order || 0,
        is_featured: data.is_featured || false,
        is_active: data.is_active !== false,
        metadata: {},
        // Location fields
        location: data.location || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        address: data.address || null,
        // Event fields
        event_date: data.event_date || null,
        end_date: data.end_date || null,
        time_start: data.time_start || null,
        time_end: data.time_end || null,
        ticket_url: data.ticket_url || null,
        price_range: data.price_range || null,
        is_recurring: data.is_recurring || false,
        recurrence_pattern: data.recurrence_pattern || null,
        // POI fields
        rating: data.rating || null,
        phone: data.phone || null,
        website_url: data.website_url || null,
        // Lifestyle fields
        activity_type: data.activity_type || null
      };

      console.log('💾 Auto-saving with content type:', data.content_type);

      let savedPost: BlogPost | null;
      
      if (postId) {
        savedPost = await blogPostService.updateBlogPost(postId, postData);
      } else {
        savedPost = await blogPostService.createBlogPost(postData, user.id);
      }

      if (savedPost && onAutoSave) {
        onAutoSave(savedPost);
      }

      console.log('✅ Auto-saved content with type:', savedPost?.content_type);
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
