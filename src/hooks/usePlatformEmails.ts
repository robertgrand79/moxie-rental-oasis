import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformEmail {
  id: string;
  email_address_id: string | null;
  external_email_id: string | null;
  direction: 'inbound' | 'outbound';
  from_address: string;
  from_name: string | null;
  to_addresses: string[];
  cc_addresses: string[] | null;
  bcc_addresses: string[] | null;
  reply_to: string | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  attachments: unknown[];
  headers: Record<string, unknown>;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  is_spam: boolean;
  labels: string[];
  thread_id: string | null;
  parent_email_id: string | null;
  in_reply_to: string | null;
  references_header: string[] | null;
  assigned_to: string | null;
  linked_inbox_item_id: string | null;
  linked_organization_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  email_address?: {
    email_address: string;
    display_name: string;
    category: string;
  };
  assignee?: {
    full_name: string;
    email: string;
  };
}

export interface EmailFilters {
  folder?: 'inbox' | 'sent' | 'starred' | 'archived' | 'spam' | 'all';
  addressId?: string;
  assignedTo?: string;
  isRead?: boolean;
  search?: string;
  threadId?: string;
}

export interface SendEmailInput {
  from_address_id?: string;
  from_email?: string;
  from_name?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string;
  template_id?: string;
  template_variables?: Record<string, string>;
  in_reply_to_email_id?: string;
  linked_inbox_item_id?: string;
  linked_organization_id?: string;
}

export const usePlatformEmails = (filters: EmailFilters = {}) => {
  const queryClient = useQueryClient();

  // Fetch emails with filters
  const { data: emails = [], isLoading, refetch } = useQuery({
    queryKey: ['platform-emails', filters],
    queryFn: async () => {
      let query = supabase
        .from('platform_emails')
        .select(`
          *,
          email_address:platform_email_addresses(email_address, display_name, category)
        `)
        .order('created_at', { ascending: false });

      // Apply folder filters
      switch (filters.folder) {
        case 'inbox':
          query = query.eq('direction', 'inbound').eq('is_archived', false).eq('is_spam', false);
          break;
        case 'sent':
          query = query.eq('direction', 'outbound').eq('is_archived', false);
          break;
        case 'starred':
          query = query.eq('is_starred', true).eq('is_archived', false);
          break;
        case 'archived':
          query = query.eq('is_archived', true);
          break;
        case 'spam':
          query = query.eq('is_spam', true);
          break;
        case 'all':
        default:
          query = query.eq('is_archived', false).eq('is_spam', false);
      }

      // Apply additional filters
      if (filters.addressId) {
        query = query.eq('email_address_id', filters.addressId);
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }
      if (filters.threadId) {
        query = query.eq('thread_id', filters.threadId);
      }
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,from_address.ilike.%${filters.search}%,body_text.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as PlatformEmail[];
    },
  });

  // Get single email
  const getEmail = async (id: string): Promise<PlatformEmail | null> => {
    const { data, error } = await supabase
      .from('platform_emails')
      .select(`
        *,
        email_address:platform_email_addresses(email_address, display_name, category)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching email:', error);
      return null;
    }
    return data as PlatformEmail;
  };

  // Get thread emails
  const { data: threadEmails = [] } = useQuery({
    queryKey: ['platform-email-thread', filters.threadId],
    queryFn: async () => {
      if (!filters.threadId) return [];
      
      const { data, error } = await supabase
        .from('platform_emails')
        .select(`
          *,
          email_address:platform_email_addresses(email_address, display_name, category)
        `)
        .eq('thread_id', filters.threadId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as PlatformEmail[];
    },
    enabled: !!filters.threadId,
  });

  // Mark as read/unread
  const markAsRead = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const { error } = await supabase
        .from('platform_emails')
        .update({ is_read: isRead })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-emails'] });
    },
  });

  // Toggle starred
  const toggleStarred = useMutation({
    mutationFn: async ({ id, isStarred }: { id: string; isStarred: boolean }) => {
      const { error } = await supabase
        .from('platform_emails')
        .update({ is_starred: isStarred })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-emails'] });
    },
  });

  // Archive/unarchive
  const toggleArchive = useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const { error } = await supabase
        .from('platform_emails')
        .update({ is_archived: isArchived })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform-emails'] });
      toast.success(variables.isArchived ? 'Email archived' : 'Email unarchived');
    },
  });

  // Mark as spam
  const markAsSpam = useMutation({
    mutationFn: async ({ id, isSpam }: { id: string; isSpam: boolean }) => {
      const { error } = await supabase
        .from('platform_emails')
        .update({ is_spam: isSpam })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform-emails'] });
      toast.success(variables.isSpam ? 'Marked as spam' : 'Removed from spam');
    },
  });

  // Assign to user
  const assignEmail = useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string | null }) => {
      const { error } = await supabase
        .from('platform_emails')
        .update({ assigned_to: userId })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-emails'] });
      toast.success('Email assigned');
    },
  });

  // Link to inbox item (support ticket)
  const linkToTicket = useMutation({
    mutationFn: async ({ emailId, ticketId }: { emailId: string; ticketId: string }) => {
      const { error } = await supabase
        .from('platform_emails')
        .update({ linked_inbox_item_id: ticketId })
        .eq('id', emailId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-emails'] });
      toast.success('Email linked to ticket');
    },
  });

  // Send email
  const sendEmail = useMutation({
    mutationFn: async (input: SendEmailInput) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('send-platform-email', {
        body: input,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-emails'] });
      toast.success('Email sent successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send email: ${error.message}`);
    },
  });

  // Delete email
  const deleteEmail = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_emails')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-emails'] });
      toast.success('Email deleted');
    },
  });

  // Get unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['platform-emails-unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('platform_emails')
        .select('*', { count: 'exact', head: true })
        .eq('direction', 'inbound')
        .eq('is_read', false)
        .eq('is_archived', false)
        .eq('is_spam', false);
      
      if (error) throw error;
      return count || 0;
    },
  });

  return {
    emails,
    threadEmails,
    isLoading,
    refetch,
    getEmail,
    unreadCount,
    markAsRead,
    toggleStarred,
    toggleArchive,
    markAsSpam,
    assignEmail,
    linkToTicket,
    sendEmail,
    deleteEmail,
  };
};