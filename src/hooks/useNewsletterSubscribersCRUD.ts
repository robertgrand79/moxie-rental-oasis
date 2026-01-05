import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { AddSubscriberFormData } from '@/components/newsletter/types';

export const useNewsletterSubscribersCRUD = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

  const addSubscriber = async (data: AddSubscriberFormData): Promise<void> => {
    if (!organization?.id) {
      toast({
        title: "Error",
        description: "Organization context is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if email already exists in this organization
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .eq('organization_id', organization.id)
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
          organization_id: organization.id,
        });

      if (error) throw error;

      toast({
        title: "Subscriber Added",
        description: "The subscriber has been successfully added to your newsletter.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add the subscriber.';
      console.error('Error adding subscriber:', err);
      toast({
        title: "Add Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const editSubscriber = async (id: string, data: Partial<AddSubscriberFormData>): Promise<void> => {
    if (!organization?.id) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('organization_id', organization.id);

      if (error) throw error;

      toast({
        title: "Subscriber Updated",
        description: "The subscriber information has been successfully updated.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update the subscriber.';
      console.error('Error updating subscriber:', err);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscriber = async (id: string): Promise<void> => {
    if (!organization?.id) return;

    try {
      setDeleting(id);
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization.id);

      if (error) throw error;

      toast({
        title: "Subscriber Deleted",
        description: "The subscriber has been permanently removed from your newsletter.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete the subscriber.';
      console.error('Error deleting subscriber:', err);
      toast({
        title: "Delete Failed",
        description: errorMessage,
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
