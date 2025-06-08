
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNewsletterStats = () => {
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriberCount();
  }, []);

  const fetchSubscriberCount = async () => {
    try {
      const { count, error } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) throw error;
      setSubscriberCount(count || 0);
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
      setSubscriberCount(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscriberCount,
    loading,
    refetch: fetchSubscriberCount
  };
};
