import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { debug } from '@/utils/debug';

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
  snoozed_until: string | null;
  ai_summary: string | null;
  ai_summary_updated_at: string | null;
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
  source_platform: string | null;
  external_message_id: string | null;
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
    title: string;
  };
}

export type InboxFilter = 'all' | 'unread' | 'awaiting_reply' | 'resolved' | 'starred' | 'snoozed';

export function useGuestInbox() {
  const { organization } = useCurrentOrganization();
  const { toast } = useToast();
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideUnknown, setHideUnknown] = useState(true);
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
      } else if (filter === 'snoozed') {
        query = query.not('snoozed_until', 'is', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Filter out unknown senders (no email and name starts with "Unknown")
      if (hideUnknown) {
        filteredData = filteredData.filter(thread =>
          !(thread.guest_name?.startsWith('Unknown') && !thread.guest_email)
        );
      }

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
  }, [organization?.id, filter, searchQuery, hideUnknown, toast]);

  // Fetch a single thread by ID (for direct navigation after refresh)
  const fetchThreadById = useCallback(async (threadId: string): Promise<InboxThread | null> => {
    if (!organization?.id) return null;

    try {
      const { data, error } = await supabase
        .from('guest_inbox_threads')
        .select('*')
        .eq('id', threadId)
        .eq('organization_id', organization.id)
        .single();

      if (error) {
        console.error('Error fetching thread:', error);
        return null;
      }

      return data as InboxThread;
    } catch (error) {
      console.error('Error fetching thread:', error);
      return null;
    }
  }, [organization?.id]);

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

  const fetchThreadReservations = useCallback(async (
    guestEmail: string | null, 
    guestPhone: string | null,
    organizationId: string
  ) => {
    // Need at least one identifier to search
    if (!guestEmail && !guestPhone) {
      debug.log('[Inbox]', 'No guest email or phone to fetch reservations');
      return [];
    }

    let query = supabase
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
        properties:property_id (title)
      `);

    // Build OR condition for email OR phone matching
    if (guestEmail && guestPhone) {
      // Normalize phone for comparison - remove non-digits
      const normalizedPhone = guestPhone.replace(/\D/g, '').slice(-10);
      query = query.or(`guest_email.ilike.${guestEmail},guest_phone.ilike.%${normalizedPhone}%`);
    } else if (guestEmail) {
      query = query.ilike('guest_email', guestEmail);
    } else if (guestPhone) {
      const normalizedPhone = guestPhone.replace(/\D/g, '').slice(-10);
      query = query.ilike('guest_phone', `%${normalizedPhone}%`);
    }

    const { data, error } = await query.order('check_in_date', { ascending: false });

    if (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }

    debug.log('[Inbox]', `Found ${data?.length || 0} reservations for guest email: ${guestEmail}, phone: ${guestPhone}`);

    return (data || []).map(r => ({
      ...r,
      property: r.properties ? { title: (r.properties as any).title } : undefined
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

  const snoozeThread = useCallback(async (threadId: string, until: Date | null) => {
    const { error } = await supabase
      .from('guest_inbox_threads')
      .update({ 
        snoozed_until: until ? until.toISOString() : null,
        updated_at: new Date().toISOString() 
      })
      .eq('id', threadId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to snooze thread',
        variant: 'destructive',
      });
      return false;
    }

    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, snoozed_until: until?.toISOString() || null } : t
    ));
    toast({
      title: until ? 'Thread snoozed' : 'Snooze removed',
      description: until ? `Will reappear ${until.toLocaleDateString()}` : 'Thread is now active',
    });
    return true;
  }, [toast]);

  const generateAISummary = useCallback(async (threadId: string, messages: ThreadMessage[]) => {
    if (messages.length === 0) return null;

    try {
      const messageHistory = messages.map(m => 
        `[${m.direction === 'inbound' ? 'Guest' : 'Host'}] ${m.message_content}`
      ).join('\n');

      const { data, error } = await supabase.functions.invoke('ai-unified-chat', {
        body: {
          message: `Summarize this guest conversation in 2-3 sentences. Focus on key requests, issues, and their resolution status:\n\n${messageHistory}`,
          systemPrompt: 'You are a helpful assistant that summarizes guest communications for property managers. Be concise and highlight action items.',
        },
      });

      if (error) throw error;

      const summary = data?.response || data?.message || null;
      
      if (summary) {
        await supabase
          .from('guest_inbox_threads')
          .update({ 
            ai_summary: summary,
            ai_summary_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          })
          .eq('id', threadId);

        setThreads(prev => prev.map(t => 
          t.id === threadId ? { 
            ...t, 
            ai_summary: summary,
            ai_summary_updated_at: new Date().toISOString()
          } : t
        ));
      }

      return summary;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI summary',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const getUnreadCount = useCallback(() => {
    return threads.filter(t => !t.is_read).length;
  }, [threads]);

  const getSnoozedCount = useCallback(() => {
    return threads.filter(t => t.snoozed_until && new Date(t.snoozed_until) > new Date()).length;
  }, [threads]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!organization?.id) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      const channelName = `inbox-updates-${organization.id}-${Date.now()}`;
      channel = supabase
        .channel(channelName)
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
    } catch (error) {
      // WebSocket may be blocked in preview/iframe environments
      console.warn('Realtime subscription unavailable:', error);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [organization?.id, fetchThreads]);

  return {
    threads,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    hideUnknown,
    setHideUnknown,
    fetchThreads,
    fetchThreadById,
    fetchThreadMessages,
    fetchThreadReservations,
    updateThreadStatus,
    markAsRead,
    snoozeThread,
    generateAISummary,
    getUnreadCount,
    getSnoozedCount,
  };
}
