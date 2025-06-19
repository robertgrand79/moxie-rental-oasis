
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedSubscriber } from '@/components/newsletter/types';

export const useEnhancedNewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState<EnhancedSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our EnhancedSubscriber type
      const transformedData: EnhancedSubscriber[] = (data || []).map(subscriber => ({
        ...subscriber,
        communication_preferences: subscriber.communication_preferences as { frequency: string; preferred_time: string; } || { frequency: 'weekly', preferred_time: 'morning' }
      }));
      
      setSubscribers(transformedData);
    } catch (err: any) {
      console.error('Error fetching subscribers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriberCommunicationPrefs = async (
    id: string, 
    updates: { 
      email_opt_in?: boolean; 
      sms_opt_in?: boolean; 
      communication_preferences?: any;
      phone?: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          last_engagement_date: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: "Subscriber communication preferences have been updated successfully.",
      });

      fetchSubscribers(); // Refresh the list
      return true;
    } catch (err: any) {
      console.error('Error updating subscriber preferences:', err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update subscriber preferences.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getSubscriberStats = () => {
    const totalSubscribers = subscribers.length;
    const emailSubscribers = subscribers.filter(s => s.email_opt_in && s.is_active).length;
    const smsSubscribers = subscribers.filter(s => s.sms_opt_in && s.is_active).length;
    const bothChannels = subscribers.filter(s => s.email_opt_in && s.sms_opt_in && s.is_active).length;
    
    const contactSources = subscribers.reduce((acc, sub) => {
      acc[sub.contact_source] = (acc[sub.contact_source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSubscribers,
      emailSubscribers,
      smsSubscribers,
      bothChannels,
      contactSources,
    };
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  return {
    subscribers,
    loading,
    error,
    refetch: fetchSubscribers,
    updateSubscriberCommunicationPrefs,
    getSubscriberStats,
  };
};
