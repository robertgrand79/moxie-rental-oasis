import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Show browser notification if permission granted
  const showBrowserNotification = useCallback((notification: AdminNotification) => {
    if (typeof window === 'undefined' || Notification.permission !== 'granted') return;
    
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id,
            data: { url: notification.action_url || '/admin' },
          });
        });
      } else {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      }
    } catch (e) {
      // Silently fail if notifications unavailable
    }
  }, []);

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
      const { error, data } = await supabase
        .from('admin_notifications')
        .update({ is_archived: true })
        .eq('id', notificationId)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No rows updated — possible RLS restriction');
      }
      return data;
    },
    onMutate: async (notificationId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-notifications'] });
      
      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData(['admin-notifications', organization?.id, user?.id]);
      
      // Optimistically remove the notification from the list
      queryClient.setQueryData(
        ['admin-notifications', organization?.id, user?.id],
        (old: AdminNotification[] | undefined) => 
          old ? old.filter(n => n.id !== notificationId) : []
      );
      
      return { previousNotifications };
    },
    onError: (err, _notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ['admin-notifications', organization?.id, user?.id],
          context.previousNotifications
        );
      }
      console.error('Archive failed:', err);
      toast({
        title: 'Failed to archive',
        description: 'Could not archive the notification. Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!organization?.id || !user?.id) return;

    // Clean up existing channel before creating new one
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (e) {
        // Ignore cleanup errors
      }
      channelRef.current = null;
    }

    try {
      const channelName = `admin-notifications-${organization.id}-${user.id}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      const channel = supabase
        .channel(channelName)
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
              
              // Show in-app toast
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
              
              // Show browser push notification
              showBrowserNotification(newNotification);
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch (error) {
      // WebSocket may be blocked in preview/iframe environments
      console.warn('Realtime notifications subscription unavailable:', error);
    }

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
        channelRef.current = null;
      }
    };
  }, [organization?.id, user?.id]);

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

// Notification type constants for consistency across the app
export const NOTIFICATION_TYPES = {
  // Booking notifications
  NEW_BOOKING: 'new_booking',
  BOOKING_CANCELLED: 'booking_cancelled',
  CHECK_IN_TODAY: 'check_in_today',
  CHECK_OUT_TODAY: 'check_out_today',
  
  // Communication notifications
  GUEST_MESSAGE: 'guest_message',
  
  // Operations notifications
  WORK_ORDER_CREATED: 'work_order_created',
  WORK_ORDER_COMPLETED: 'work_order_completed',
  WORK_ORDER_ASSIGNED: 'work_order_assigned',
  
  // Payment notifications
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  
  // System notifications
  SYSTEM_ALERT: 'system_alert',
  LOW_AVAILABILITY: 'low_availability',
  REVENUE_MILESTONE: 'revenue_milestone',
  SECURITY_ALERT: 'security_alert',
  API_ERROR: 'api_error',
} as const;

export const NOTIFICATION_CATEGORIES = {
  BOOKINGS: 'bookings',
  COMMUNICATIONS: 'communications',
  OPERATIONS: 'operations',
  PAYMENTS: 'payments',
  SYSTEM: 'system',
} as const;
