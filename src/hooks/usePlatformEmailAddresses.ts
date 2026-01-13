import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformEmailAddress {
  id: string;
  email_address: string;
  display_name: string;
  category: 'support' | 'billing' | 'sales' | 'general';
  is_active: boolean;
  auto_assign_to: string | null;
  auto_create_ticket: boolean;
  resend_domain_verified: boolean;
  webhook_configured: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  assignee?: {
    full_name: string;
    email: string;
  };
}

export interface CreateEmailAddressInput {
  email_address: string;
  display_name: string;
  category: 'support' | 'billing' | 'sales' | 'general';
  auto_assign_to?: string;
  auto_create_ticket?: boolean;
}

export interface UpdateEmailAddressInput {
  display_name?: string;
  category?: 'support' | 'billing' | 'sales' | 'general';
  is_active?: boolean;
  auto_assign_to?: string | null;
  auto_create_ticket?: boolean;
  resend_domain_verified?: boolean;
  webhook_configured?: boolean;
}

export const usePlatformEmailAddresses = () => {
  const queryClient = useQueryClient();

  // Fetch all email addresses
  const { data: addresses = [], isLoading, refetch } = useQuery({
    queryKey: ['platform-email-addresses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_email_addresses')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PlatformEmailAddress[];
    },
  });

  // Get active addresses for sending
  const activeAddresses = addresses.filter(a => a.is_active);

  // Create new email address
  const createAddress = useMutation({
    mutationFn: async (input: CreateEmailAddressInput) => {
      const { data, error } = await supabase
        .from('platform_email_addresses')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-email-addresses'] });
      toast.success('Email address added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add email address: ${error.message}`);
    },
  });

  // Update email address
  const updateAddress = useMutation({
    mutationFn: async ({ id, ...input }: UpdateEmailAddressInput & { id: string }) => {
      const { data, error } = await supabase
        .from('platform_email_addresses')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-email-addresses'] });
      toast.success('Email address updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update email address: ${error.message}`);
    },
  });

  // Toggle active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('platform_email_addresses')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform-email-addresses'] });
      toast.success(variables.isActive ? 'Email address activated' : 'Email address deactivated');
    },
  });

  // Delete email address
  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_email_addresses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-email-addresses'] });
      toast.success('Email address deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete email address: ${error.message}`);
    },
  });

  // Get address by category
  const getAddressByCategory = (category: string) => {
    return addresses.find(a => a.category === category && a.is_active);
  };

  return {
    addresses,
    activeAddresses,
    isLoading,
    refetch,
    createAddress,
    updateAddress,
    toggleActive,
    deleteAddress,
    getAddressByCategory,
  };
};