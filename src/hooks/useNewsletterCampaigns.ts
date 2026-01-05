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

  useEffect(() => {
    fetchCampaigns();
  }, [organization?.id]);

  return {
    campaigns,
    loading,
    error,
    deleting,
    editing,
    refetch: fetchCampaigns,
    deleteCampaign,
    editCampaign,
  };
};
