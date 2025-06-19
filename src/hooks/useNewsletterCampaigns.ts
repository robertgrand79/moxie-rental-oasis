
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  sent_at: string | null;
  recipient_count: number;
  blog_post_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useNewsletterCampaigns = () => {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err: any) {
      console.error('Error fetching newsletter campaigns:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      setDeleting(campaignId);
      
      const { error } = await supabase
        .from('newsletter_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      // Optimistically update the UI
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      
      toast({
        title: "Campaign Deleted",
        description: "The newsletter campaign has been successfully deleted.",
      });

    } catch (err: any) {
      console.error('Error deleting newsletter campaign:', err);
      toast({
        title: "Delete Failed",
        description: err.message || "Failed to delete the newsletter campaign.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    error,
    deleting,
    refetch: fetchCampaigns,
    deleteCampaign
  };
};
