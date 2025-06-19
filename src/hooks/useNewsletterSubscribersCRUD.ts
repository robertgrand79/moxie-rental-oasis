
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AddSubscriberFormData } from '@/components/newsletter/types';

export const useNewsletterSubscribersCRUD = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const addSubscriber = async (data: AddSubscriberFormData): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check if email already exists
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .single();

      if (existing) {
        toast({
          title: "Email Already Exists",
          description: "This email address is already subscribed to your newsletter.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: data.email.toLowerCase(),
          name: data.name || null,
          phone: data.phone || null,
          is_active: true,
          email_opt_in: data.emailOptIn,
          sms_opt_in: data.smsOptIn,
          communication_preferences: data.communicationPreferences,
          contact_source: data.contactSource,
          last_engagement_date: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Subscriber Added",
        description: "The subscriber has been successfully added to your newsletter.",
      });
    } catch (err: any) {
      console.error('Error adding subscriber:', err);
      toast({
        title: "Add Failed",
        description: err.message || "Failed to add the subscriber.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const editSubscriber = async (id: string, data: any): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Subscriber Updated",
        description: "The subscriber information has been successfully updated.",
      });
    } catch (err: any) {
      console.error('Error updating subscriber:', err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update the subscriber.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscriber = async (id: string): Promise<void> => {
    try {
      setDeleting(id);
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Subscriber Deleted",
        description: "The subscriber has been permanently removed from your newsletter.",
      });
    } catch (err: any) {
      console.error('Error deleting subscriber:', err);
      toast({
        title: "Delete Failed",
        description: err.message || "Failed to delete the subscriber.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  return {
    addSubscriber,
    editSubscriber,
    deleteSubscriber,
    isLoading,
    deleting,
  };
};
