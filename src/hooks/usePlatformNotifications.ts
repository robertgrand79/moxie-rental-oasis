import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface PlatformNotification {
  id: string;
  notification_type: string;
  category: string;
  title: string;
  message: string;
  action_url: string | null;
  metadata: Record<string, any>;
  is_read: boolean;
  is_archived: boolean;
  priority: string;
  created_at: string;
}

export const usePlatformNotifications = (options?: { limit?: number; includeRead?: boolean }) => {
  const queryClient = useQueryClient();
  const limit = options?.limit || 50;
  const includeRead = options?.includeRead ?? true;

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['platform-notifications', limit, includeRead],
    queryFn: async () => {
      let query = supabase
        .from('platform_notifications')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!includeRead) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PlatformNotification[];
    },
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['platform-notifications-unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('platform_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('is_archived', false);

      if (error) throw error;
      return count || 0;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('platform-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'platform_notifications',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['platform-notifications'] });
          queryClient.invalidateQueries({ queryKey: ['platform-notifications-unread-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('platform_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['platform-notifications-unread-count'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('platform_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['platform-notifications-unread-count'] });
    },
  });

  const archiveNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('platform_notifications')
        .update({ is_archived: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['platform-notifications-unread-count'] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    archiveNotification: archiveNotification.mutate,
  };
};
