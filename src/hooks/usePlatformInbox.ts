import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type InboxType = 'support' | 'feedback';
export type InboxStatus = 'open' | 'in_progress' | 'planned' | 'resolved' | 'implemented' | 'closed';
export type InboxPriority = 'low' | 'medium' | 'high' | 'critical';

export interface PlatformInboxItem {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  type: InboxType;
  category: string;
  priority: InboxPriority;
  status: InboxStatus;
  subject: string;
  description: string;
  email: string | null;
  name: string | null;
  ticket_number: string | null;
  attachments: string[] | null;
  assigned_to: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  votes: number;
  admin_notes: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInboxItemInput {
  type: InboxType;
  category: string;
  priority?: InboxPriority;
  subject: string;
  description: string;
  email?: string;
  name?: string;
  organization_id?: string;
  user_id?: string;
}

export interface UpdateInboxItemInput {
  status?: InboxStatus;
  priority?: InboxPriority;
  assigned_to?: string | null;
  resolution_notes?: string;
  admin_notes?: string;
  is_archived?: boolean;
  archived_at?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  votes?: number;
}

export const usePlatformInbox = () => {
  const queryClient = useQueryClient();

  // Fetch all inbox items (for platform admins)
  const { 
    data: items, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['platform-inbox'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_inbox')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PlatformInboxItem[];
    },
  });

  // Fetch user's own inbox items
  const useUserInboxItems = (userId: string | undefined) => {
    return useQuery({
      queryKey: ['user-inbox-items', userId],
      queryFn: async () => {
        if (!userId) return [];
        const { data, error } = await supabase
          .from('platform_inbox')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as PlatformInboxItem[];
      },
      enabled: !!userId,
    });
  };

  // Create inbox item
  const createItem = useMutation({
    mutationFn: async (input: CreateInboxItemInput) => {
      const { data, error } = await supabase
        .from('platform_inbox')
        .insert({
          ...input,
          priority: input.priority || 'medium',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as PlatformInboxItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['user-inbox-items'] });
      const type = variables.type === 'support' ? 'Support ticket' : 'Feedback';
      toast.success(`${type} submitted successfully`);
    },
    onError: (error) => {
      toast.error('Failed to submit: ' + error.message);
    },
  });

  // Update inbox item
  const updateItem = useMutation({
    mutationFn: async ({ 
      itemId, 
      updates 
    }: { 
      itemId: string; 
      updates: UpdateInboxItemInput;
    }) => {
      const { error } = await supabase
        .from('platform_inbox')
        .update(updates)
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['user-inbox-items'] });
      toast.success('Updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  // Delete inbox item
  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('platform_inbox')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['user-inbox-items'] });
      toast.success('Deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  // Convert item type (support <-> feedback)
  const convertType = useMutation({
    mutationFn: async ({ 
      itemId, 
      newType 
    }: { 
      itemId: string; 
      newType: InboxType;
    }) => {
      const updates: any = { type: newType };
      
      // Clear ticket number if converting to feedback
      if (newType === 'feedback') {
        updates.ticket_number = null;
      }
      
      const { error } = await supabase
        .from('platform_inbox')
        .update(updates)
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: (_, { newType }) => {
      queryClient.invalidateQueries({ queryKey: ['platform-inbox'] });
      toast.success(`Converted to ${newType}`);
    },
    onError: (error) => {
      toast.error('Failed to convert: ' + error.message);
    },
  });

  // Helper to get counts
  const getCounts = (itemsList: PlatformInboxItem[] | undefined) => {
    if (!itemsList) return { total: 0, support: 0, feedback: 0, open: 0, inProgress: 0 };
    
    return {
      total: itemsList.length,
      support: itemsList.filter(i => i.type === 'support').length,
      feedback: itemsList.filter(i => i.type === 'feedback').length,
      open: itemsList.filter(i => i.status === 'open').length,
      inProgress: itemsList.filter(i => i.status === 'in_progress').length,
    };
  };

  return {
    items,
    isLoading,
    refetch,
    useUserInboxItems,
    createItem: createItem.mutate,
    createItemAsync: createItem.mutateAsync,
    isCreating: createItem.isPending,
    updateItem: updateItem.mutate,
    isUpdating: updateItem.isPending,
    deleteItem: deleteItem.mutate,
    isDeleting: deleteItem.isPending,
    convertType: convertType.mutate,
    isConverting: convertType.isPending,
    getCounts,
  };
};
