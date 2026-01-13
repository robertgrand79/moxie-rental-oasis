import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

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
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['platform-notifications', limit, includeRead],
    queryFn: async () => {
      try {
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
        if (error) {
          console.warn('Platform notifications query error:', error.message);
          return [];
        }
        return data as PlatformNotification[];
      } catch (err) {
        console.warn('Platform notifications error:', err);
        return [];
      }
    },
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['platform-notifications-unread-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('platform_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .eq('is_archived', false);

        if (error) {
          console.warn('Platform notifications count error:', error.message);
          return 0;
        }
        return count || 0;
      } catch (err) {
        console.warn('Platform notifications count error:', err);
        return 0;
      }
    },
  });

  // Real-time subscription with race condition guard
  useEffect(() => {
    // Prevent duplicate subscriptions
    if (channelRef.current) {
      return;
    }

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

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
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
