import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminNotification {
  id: string;
  organization_id: string;
  user_id: string | null;
  notification_type: string;
  category: string;
  title: string;
  message: string;
  action_url: string | null;
  metadata: Record<string, any>;
  is_read: boolean;
  is_archived: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
}

export const useNotifications = () => {
  const { organization } = useCurrentOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-notifications', organization?.id, user?.id],
    queryFn: async () => {
      if (!organization?.id || !user?.id) return [];

      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_archived', false)
        .or(`user_id.is.null,user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data as AdminNotification[];
    },
    enabled: !!organization?.id && !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!organization?.id || !user?.id) return;

      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('organization_id', organization.id)
        .eq('is_read', false)
        .or(`user_id.is.null,user_id.eq.${user.id}`);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // Archive notification mutation
  const archiveMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_archived: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!organization?.id || !user?.id) return;

    const channel = supabase
      .channel('admin-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
          filter: `organization_id=eq.${organization.id}`,
        },
        (payload) => {
          // Check if notification is for this user
          const newNotification = payload.new as AdminNotification;
          if (newNotification.user_id === null || newNotification.user_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id, user?.id, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    archiveNotification: archiveMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};

// Helper to create a notification (for use in other hooks/components)
export const createNotification = async (notification: {
  organization_id: string;
  user_id?: string | null;
  notification_type: string;
  category: string;
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}) => {
  const { error } = await supabase
    .from('admin_notifications')
    .insert({
      organization_id: notification.organization_id,
      user_id: notification.user_id || null,
      notification_type: notification.notification_type,
      category: notification.category,
      title: notification.title,
      message: notification.message,
      action_url: notification.action_url || null,
      metadata: notification.metadata || {},
      priority: notification.priority || 'normal',
    });

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
