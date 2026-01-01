import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface GuestNotification {
  id: string;
  guest_profile_id: string;
  reservation_id: string | null;
  notification_type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

export function useGuestNotifications(guestProfileId: string | null) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['guest-notifications', guestProfileId],
    queryFn: async () => {
      if (!guestProfileId) return [];

      const { data, error } = await supabase
        .from('guest_notifications')
        .select('*')
        .eq('guest_profile_id', guestProfileId)
        .or('scheduled_for.is.null,scheduled_for.lte.now()')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as GuestNotification[];
    },
    enabled: !!guestProfileId,
    staleTime: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('guest_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-notifications', guestProfileId] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!guestProfileId) return;

      const { error } = await supabase
        .from('guest_notifications')
        .update({ is_read: true })
        .eq('guest_profile_id', guestProfileId)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-notifications', guestProfileId] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!guestProfileId) return;

    // Clean up any previous channel first (prevents "subscribe multiple times" crashes)
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch {
        // ignore
      }
      channelRef.current = null;
    }

    const channelName = `guest-notifications-${guestProfileId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guest_notifications',
          filter: `guest_profile_id=eq.${guestProfileId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['guest-notifications', guestProfileId] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch {
          // ignore
        }
        channelRef.current = null;
      }
    };
  }, [guestProfileId, queryClient]);

  return {
    notifications,
    isLoading,
    unreadCount,
    refetch,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  };
}
