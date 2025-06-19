
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddSubscriberData {
  email: string;
  name: string;
  is_active: boolean;
}

interface EditSubscriberData {
  email: string;
  name: string;
  is_active: boolean;
}

export const useNewsletterSubscribersCRUD = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const addSubscriber = async (data: AddSubscriberData) => {
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
        return false;
      }

      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: data.email.toLowerCase(),
          name: data.name || null,
          is_active: data.is_active,
        });

      if (error) throw error;

      toast({
        title: "Subscriber Added",
        description: "The subscriber has been successfully added to your newsletter.",
      });

      return true;
    } catch (err: any) {
      console.error('Error adding subscriber:', err);
      toast({
        title: "Add Failed",
        description: err.message || "Failed to add the subscriber.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const editSubscriber = async (id: string, data: EditSubscriberData) => {
    try {
      setIsLoading(true);
      
      // Check if new email already exists (excluding current subscriber)
      if (data.email) {
        const { data: existing } = await supabase
          .from('newsletter_subscribers')
          .select('id')
          .eq('email', data.email.toLowerCase())
          .neq('id', id)
          .single();

        if (existing) {
          toast({
            title: "Email Already Exists",
            description: "Another subscriber already uses this email address.",
            variant: "destructive",
          });
          return false;
        }
      }

      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          email: data.email.toLowerCase(),
          name: data.name || null,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Subscriber Updated",
        description: "The subscriber information has been successfully updated.",
      });

      return true;
    } catch (err: any) {
      console.error('Error updating subscriber:', err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update the subscriber.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscriber = async (id: string) => {
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

      return true;
    } catch (err: any) {
      console.error('Error deleting subscriber:', err);
      toast({
        title: "Delete Failed",
        description: err.message || "Failed to delete the subscriber.",
        variant: "destructive",
      });
      return false;
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
