
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNewsletterStats = () => {
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [smsSubscriberCount, setSmsSubscriberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get email subscriber count
      const { count: emailCount, error: emailError } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('email_opt_in', true);

      if (emailError) {
        console.error('Error fetching email subscriber count:', emailError);
      } else {
        setSubscriberCount(emailCount);
      }

      // Get SMS subscriber count
      const { count: smsCount, error: smsError } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('sms_opt_in', true)
        .not('phone', 'is', null);

      if (smsError) {
        console.error('Error fetching SMS subscriber count:', smsError);
      } else {
        setSmsSubscriberCount(smsCount);
      }

    } catch (error) {
      console.error('Error fetching newsletter stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = () => {
    fetchStats();
  };

  return {
    subscriberCount,
    smsSubscriberCount,
    loading,
    refetch,
  };
};
