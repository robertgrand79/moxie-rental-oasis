import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export type SuppressionReason = 'hard_bounce' | 'soft_bounce' | 'complaint' | 'unsubscribed' | 'manual';

export interface SuppressionEntry {
  id: string;
  organization_id: string;
  email: string;
  reason: SuppressionReason;
  resend_event_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export const useNewsletterSuppression = () => {
  const [entries, setEntries] = useState<SuppressionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

  const fetchEntries = useCallback(async () => {
    if (!organization?.id) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('newsletter_suppression')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching suppression list:', error);
      toast({ title: 'Suppression list failed to load', description: error.message, variant: 'destructive' });
    } else {
      setEntries((data ?? []) as SuppressionEntry[]);
    }
    setLoading(false);
  }, [organization?.id, toast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addManual = async (email: string) => {
    if (!organization?.id) return false;
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes('@')) {
      toast({ title: 'Invalid email', variant: 'destructive' });
      return false;
    }
    const { data, error } = await (supabase as any)
      .from('newsletter_suppression')
      .upsert(
        { organization_id: organization.id, email: normalized, reason: 'manual' },
        { onConflict: 'organization_id,email' },
      )
      .select()
      .single();
    if (error) {
      toast({ title: 'Failed to add', description: error.message, variant: 'destructive' });
      return false;
    }
    setEntries(prev => {
      const without = prev.filter(e => e.email !== normalized);
      return [data as SuppressionEntry, ...without];
    });
    toast({ title: 'Email suppressed', description: `${normalized} won't receive future sends.` });
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from('newsletter_suppression').delete().eq('id', id);
    if (error) {
      toast({ title: 'Failed to remove', description: error.message, variant: 'destructive' });
      return false;
    }
    setEntries(prev => prev.filter(e => e.id !== id));
    toast({ title: 'Suppression removed', description: 'This address can receive newsletters again.' });
    return true;
  };

  return { entries, loading, refetch: fetchEntries, addManual, remove };
};
