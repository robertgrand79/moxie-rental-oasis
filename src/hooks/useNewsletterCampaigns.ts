import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { NewsletterCampaign } from '@/components/admin/newsletter/types';

export const useNewsletterCampaigns = () => {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

  const fetchCampaigns = async () => {
    if (!organization?.id) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching newsletter campaigns:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!organization?.id) return;

    try {
      setDeleting(campaignId);
      
      const { error } = await supabase
        .from('newsletter_campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('organization_id', organization.id);

      if (error) throw error;

      // Optimistically update the UI
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      
      toast({
        title: "Campaign Deleted",
        description: "The newsletter campaign has been successfully deleted.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete the newsletter campaign.';
      console.error('Error deleting newsletter campaign:', err);
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const editCampaign = async (campaignId: string, data: { subject: string; content: string }) => {
    if (!organization?.id) return;

    try {
      setEditing(campaignId);
      
      const { error } = await supabase
        .from('newsletter_campaigns')
        .update({
          subject: data.subject,
          content: data.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId)
        .eq('organization_id', organization.id);

      if (error) throw error;

      // Optimistically update the UI
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, subject: data.subject, content: data.content, updated_at: new Date().toISOString() }
          : campaign
      ));
      
      toast({
        title: "Campaign Updated",
        description: "The newsletter campaign has been successfully updated.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update the newsletter campaign.';
      console.error('Error updating newsletter campaign:', err);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setEditing(null);
    }
  };

  // Clone an existing campaign as a fresh draft so users can reuse a past
  // newsletter as a template without recreating it from scratch. We copy the
  // creative payload (subject, content, cover image, linked content) and
  // explicitly drop all send-state fields (sent_at, recipient_count, sent_count,
  // failed_count, completed_at, open/click metrics) so the new row starts in
  // the Draft state machine.
  const duplicateCampaign = async (campaignId: string): Promise<NewsletterCampaign | null> => {
    if (!organization?.id) return null;

    try {
      setDuplicating(campaignId);

      const source = campaigns.find(c => c.id === campaignId);
      if (!source) throw new Error('Campaign not found');

      const { data: inserted, error } = await supabase
        .from('newsletter_campaigns')
        .insert({
          subject: `Copy of ${source.subject}`,
          content: source.content,
          cover_image_url: source.cover_image_url ?? null,
          organization_id: organization.id,
          recipient_count: 0,
          sent_at: null,
        })
        .select()
        .single();

      if (error) throw error;

      setCampaigns(prev => [inserted as NewsletterCampaign, ...prev]);

      toast({
        title: 'Campaign Duplicated',
        description: `Created "${inserted.subject}" as a new draft.`,
      });

      return inserted as NewsletterCampaign;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate the newsletter campaign.';
      console.error('Error duplicating newsletter campaign:', err);
      toast({
        title: 'Duplicate Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setDuplicating(null);
    }
  };

  // Demote a scheduled (or terminally-failed) campaign back to a plain draft.
  // Clears scheduled_at, resets the retry counter, and clears the failure
  // reason so the cron worker won't pick it up. The campaign content itself
  // is untouched, so admins can edit and re-send/re-schedule from there.
  const cancelSchedule = async (campaignId: string) => {
    if (!organization?.id) return false;
    const { error } = await supabase
      .from('newsletter_campaigns')
      .update({
        scheduled_at: null,
        send_attempts: 0,
        send_failure_reason: null,
        last_attempt_at: null,
      } as any)
      .eq('id', campaignId)
      .eq('organization_id', organization.id);
    if (error) {
      toast({ title: 'Cancel failed', description: error.message, variant: 'destructive' });
      return false;
    }
    setCampaigns(prev => prev.map(c =>
      c.id === campaignId
        ? ({ ...c, scheduled_at: null, send_attempts: 0, send_failure_reason: null } as any)
        : c
    ));
    toast({ title: 'Schedule cancelled', description: 'Campaign moved back to Draft.' });
    return true;
  };

  // Retry a campaign that hit the max-attempts ceiling. Resets attempts and
  // re-arms scheduled_at to "now" so the next cron tick picks it up.
  const retrySchedule = async (campaignId: string) => {
    if (!organization?.id) return false;
    const { error } = await supabase
      .from('newsletter_campaigns')
      .update({
        scheduled_at: new Date().toISOString(),
        send_attempts: 0,
        send_failure_reason: null,
      } as any)
      .eq('id', campaignId)
      .eq('organization_id', organization.id);
    if (error) {
      toast({ title: 'Retry failed', description: error.message, variant: 'destructive' });
      return false;
    }
    setCampaigns(prev => prev.map(c =>
      c.id === campaignId
        ? ({ ...c, scheduled_at: new Date().toISOString(), send_attempts: 0, send_failure_reason: null } as any)
        : c
    ));
    toast({ title: 'Retry queued', description: 'Will dispatch within 5 minutes.' });
    return true;
  };

  useEffect(() => {
    fetchCampaigns();
  }, [organization?.id]);

  return {
    campaigns,
    loading,
    error,
    deleting,
    editing,
    duplicating,
    refetch: fetchCampaigns,
    deleteCampaign,
    editCampaign,
    duplicateCampaign,
    cancelSchedule,
    retrySchedule,
  };
};
