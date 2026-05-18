import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export interface NewsletterList {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  is_test: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface NewsletterListMember {
  id: string;
  list_id: string;
  organization_id: string;
  email: string;
  name: string | null;
  subscriber_id: string | null;
  created_at: string;
}

export const useNewsletterLists = () => {
  const [lists, setLists] = useState<NewsletterList[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

  const fetchLists = useCallback(async () => {
    if (!organization?.id) {
      setLists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('newsletter_lists')
      .select('*, newsletter_list_members(count)')
      .eq('organization_id', organization.id)
      .order('updated_at', { ascending: false });
    if (error) {
      console.error('Error fetching lists:', error);
      toast({ title: 'Lists failed to load', description: error.message, variant: 'destructive' });
    } else {
      const enriched = (data ?? []).map((row: any) => ({
        ...row,
        member_count: row.newsletter_list_members?.[0]?.count ?? 0,
      }));
      setLists(enriched as NewsletterList[]);
    }
    setLoading(false);
  }, [organization?.id, toast]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = async (input: { name: string; description?: string; isTest?: boolean }) => {
    if (!organization?.id) return null;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await (supabase as any)
      .from('newsletter_lists')
      .insert({
        organization_id: organization.id,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        is_test: input.isTest ?? false,
        created_by: user?.id ?? null,
      })
      .select()
      .single();
    if (error) {
      toast({ title: 'Create list failed', description: error.message, variant: 'destructive' });
      return null;
    }
    setLists(prev => [{ ...(data as NewsletterList), member_count: 0 }, ...prev]);
    toast({ title: 'List created', description: `"${input.name}" is empty — add members to start.` });
    return data as NewsletterList;
  };

  const deleteList = async (listId: string) => {
    const { error } = await (supabase as any).from('newsletter_lists').delete().eq('id', listId);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return false;
    }
    setLists(prev => prev.filter(l => l.id !== listId));
    toast({ title: 'List deleted' });
    return true;
  };

  return { lists, loading, refetch: fetchLists, createList, deleteList };
};

// Separate hook for managing the members of one list — kept distinct from the
// org-wide lists hook so a list-detail view doesn't refetch every list when
// the user adds a single member.
export const useNewsletterListMembers = (listId: string | null) => {
  const [members, setMembers] = useState<NewsletterListMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

  const fetchMembers = useCallback(async () => {
    if (!listId || !organization?.id) {
      setMembers([]);
      return;
    }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('newsletter_list_members')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Members failed to load', description: error.message, variant: 'destructive' });
    } else {
      setMembers((data ?? []) as NewsletterListMember[]);
    }
    setLoading(false);
  }, [listId, organization?.id, toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Accept either a single email or a comma/newline-separated batch.
  // Splits, validates, dedupes against existing members, and bulk-inserts.
  // For each new email, also looks up whether it matches an existing
  // newsletter_subscribers row so we can link via subscriber_id.
  const addMembers = async (raw: string) => {
    if (!listId || !organization?.id) return 0;
    const emails = raw
      .split(/[\s,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes('@'));
    if (emails.length === 0) {
      toast({ title: 'No valid emails found', variant: 'destructive' });
      return 0;
    }
    const unique = [...new Set(emails)].filter(e => !members.some(m => m.email === e));
    if (unique.length === 0) {
      toast({ title: 'All addresses already in list' });
      return 0;
    }

    // Match to existing subscribers in one query so we can populate subscriber_id.
    const { data: matching } = await (supabase as any)
      .from('newsletter_subscribers')
      .select('id, email, name')
      .eq('organization_id', organization.id)
      .in('email', unique);
    const subscriberMap = new Map<string, { id: string; name: string | null }>();
    (matching ?? []).forEach((s: any) => subscriberMap.set(s.email.toLowerCase(), s));

    const rows = unique.map(email => {
      const sub = subscriberMap.get(email);
      return {
        list_id: listId,
        organization_id: organization.id,
        email,
        name: sub?.name ?? null,
        subscriber_id: sub?.id ?? null,
      };
    });
    const { data, error } = await (supabase as any)
      .from('newsletter_list_members')
      .insert(rows)
      .select();
    if (error) {
      toast({ title: 'Add failed', description: error.message, variant: 'destructive' });
      return 0;
    }
    setMembers(prev => [...(data as NewsletterListMember[]), ...prev]);
    toast({ title: `Added ${data?.length ?? 0} member${data?.length === 1 ? '' : 's'}` });
    return data?.length ?? 0;
  };

  const removeMember = async (memberId: string) => {
    const { error } = await (supabase as any).from('newsletter_list_members').delete().eq('id', memberId);
    if (error) {
      toast({ title: 'Remove failed', description: error.message, variant: 'destructive' });
      return false;
    }
    setMembers(prev => prev.filter(m => m.id !== memberId));
    return true;
  };

  return { members, loading, refetch: fetchMembers, addMembers, removeMember };
};
