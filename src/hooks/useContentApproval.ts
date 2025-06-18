
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ContentItem {
  id: string;
  title: string;
  type: 'blog_post' | 'property_description' | 'page_content' | 'ai_response' | 'poi' | 'events' | 'lifestyle' | 'site-content';
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  created_by: string;
  original_prompt?: string;
  feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useContentApproval = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContentItems = async () => {
    console.log('Fetching content approval items...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_approval_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching content items:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch content items.',
          variant: 'destructive'
        });
        setContentItems([]);
      } else {
        console.log('Fetched content items:', data);
        // Type assertion to ensure proper typing
        const typedItems = (data || []).map(item => ({
          ...item,
          type: item.type as ContentItem['type'],
          status: item.status as ContentItem['status']
        }));
        setContentItems(typedItems);
      }
    } catch (error) {
      console.error('Error in fetchContentItems:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch content items.',
        variant: 'destructive'
      });
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateContentStatus = async (
    itemId: string, 
    status: 'approved' | 'rejected' | 'needs_revision', 
    feedback?: string
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update content status.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('content_approval_items')
        .update({
          status,
          feedback,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating content status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update content status.',
          variant: 'destructive'
        });
        return false;
      }

      // Update local state
      setContentItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              status, 
              feedback,
              reviewed_by: user.id,
              reviewed_at: new Date().toISOString()
            }
          : item
      ));

      const statusMessages = {
        approved: 'Content approved successfully!',
        rejected: 'Content rejected.',
        needs_revision: 'Revision requested for content.'
      };

      toast({
        title: 'Success',
        description: statusMessages[status]
      });

      return true;
    } catch (error) {
      console.error('Error in updateContentStatus:', error);
      return false;
    }
  };

  const addContentItem = async (itemData: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<ContentItem | null> => {
    try {
      const { data, error } = await supabase
        .from('content_approval_items')
        .insert([itemData])
        .select()
        .single();

      if (error) {
        console.error('Error adding content item:', error);
        toast({
          title: 'Error',
          description: 'Failed to add content item.',
          variant: 'destructive'
        });
        return null;
      }

      // Type assertion for the returned item
      const typedItem = {
        ...data,
        type: data.type as ContentItem['type'],
        status: data.status as ContentItem['status']
      };

      setContentItems(prev => [typedItem, ...prev]);
      toast({
        title: 'Success',
        description: 'Content item added for review!'
      });

      return typedItem;
    } catch (error) {
      console.error('Error in addContentItem:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchContentItems();
  }, []);

  return {
    contentItems,
    loading,
    updateContentStatus,
    addContentItem,
    refetch: fetchContentItems
  };
};
