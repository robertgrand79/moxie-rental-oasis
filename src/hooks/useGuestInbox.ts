import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

export interface InboxThread {
  id: string;
  organization_id: string;
  guest_identifier: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  status: 'active' | 'awaiting_reply' | 'resolved' | 'starred';
  is_read: boolean;
  last_message_at: string | null;
  last_message_preview: string | null;
  reservation_count: number;
  created_at: string;
  updated_at: string;
}

export interface ThreadMessage {
  id: string;
  thread_id: string | null;
  reservation_id: string;
  message_type: string;
  subject: string;
  message_content: string;
  delivery_status: string | null;
  direction: string | null;
  sent_at: string | null;
  created_at: string;
  sender_email: string | null;
}

export interface ThreadReservation {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in_date: string;
  check_out_date: string;
  booking_status: string;
  property?: {
    name: string;
  };
}

export type InboxFilter = 'all' | 'unread' | 'awaiting_reply' | 'resolved' | 'starred';

export function useGuestInbox() {
  const { organization } = useCurrentOrganization();
  const { toast } = useToast();
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchThreads = useCallback(async () => {
    if (!organization?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('guest_inbox_threads')
        .select('*')
        .eq('organization_id', organization.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      // Apply status filter
      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'awaiting_reply') {
        query = query.eq('status', 'awaiting_reply');
      } else if (filter === 'resolved') {
        query = query.eq('status', 'resolved');
      } else if (filter === 'starred') {
        query = query.eq('status', 'starred');
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Apply search filter client-side
      if (searchQuery.trim()) {
        const search = searchQuery.toLowerCase();
        filteredData = filteredData.filter(thread =>
          thread.guest_name?.toLowerCase().includes(search) ||
          thread.guest_email?.toLowerCase().includes(search) ||
          thread.guest_phone?.includes(search)
        );
      }

      setThreads(filteredData as InboxThread[]);
    } catch (error) {
      console.error('Error fetching inbox threads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inbox',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [organization?.id, filter, searchQuery, toast]);

  const fetchThreadMessages = useCallback(async (threadId: string) => {
    const { data, error } = await supabase
      .from('guest_communications')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching thread messages:', error);
      return [];
    }

    return data as ThreadMessage[];
  }, []);

  const fetchThreadReservations = useCallback(async (guestEmail: string, organizationId: string) => {
    const { data, error } = await supabase
      .from('property_reservations')
      .select(`
        id,
        property_id,
        guest_name,
        guest_email,
        guest_phone,
        check_in_date,
        check_out_date,
        booking_status,
        properties:property_id (name)
      `)
      .eq('guest_email', guestEmail)
      .order('check_in_date', { ascending: false });

    if (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }

    return data.map(r => ({
      ...r,
      property: r.properties ? { name: (r.properties as any).name } : undefined
    })) as ThreadReservation[];
  }, []);

  const updateThreadStatus = useCallback(async (threadId: string, status: InboxThread['status']) => {
    const { error } = await supabase
      .from('guest_inbox_threads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update thread status',
        variant: 'destructive',
      });
      return false;
    }

    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, status } : t));
    return true;
  }, [toast]);

  const markAsRead = useCallback(async (threadId: string) => {
    const { error } = await supabase
      .from('guest_inbox_threads')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', threadId);

    if (error) {
      console.error('Error marking thread as read:', error);
      return false;
    }

    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_read: true } : t));
    return true;
  }, []);

  const getUnreadCount = useCallback(() => {
    return threads.filter(t => !t.is_read).length;
  }, [threads]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!organization?.id) return;

    const channel = supabase
      .channel('inbox-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guest_inbox_threads',
          filter: `organization_id=eq.${organization.id}`
        },
        () => {
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id, fetchThreads]);

  return {
    threads,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    fetchThreads,
    fetchThreadMessages,
    fetchThreadReservations,
    updateThreadStatus,
    markAsRead,
    getUnreadCount,
  };
}
