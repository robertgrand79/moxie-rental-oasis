import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PropertyFee {
  id: string;
  property_id: string;
  fee_name: string;
  fee_type: 'flat' | 'percentage';
  fee_amount: number;
  fee_applies_to: 'booking' | 'per_night' | 'per_guest';
  is_active: boolean;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyFee {
  property_id: string;
  fee_name: string;
  fee_type: 'flat' | 'percentage';
  fee_amount: number;
  fee_applies_to: 'booking' | 'per_night' | 'per_guest';
  is_active?: boolean;
  description?: string;
  display_order?: number;
}

export interface UpdatePropertyFee {
  id: string;
  fee_name?: string;
  fee_type?: 'flat' | 'percentage';
  fee_amount?: number;
  fee_applies_to?: 'booking' | 'per_night' | 'per_guest';
  is_active?: boolean;
  description?: string;
  display_order?: number;
}

export const usePropertyFees = (propertyId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['property-fees', propertyId];

  const { data: fees = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_fees')
        .select('*')
        .eq('property_id', propertyId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as PropertyFee[];
    },
    enabled: !!propertyId,
  });

  const createFee = useMutation({
    mutationFn: async (fee: CreatePropertyFee) => {
      const { data, error } = await supabase
        .from('property_fees')
        .insert(fee)
        .select()
        .single();

      if (error) throw error;
      return data as PropertyFee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Success',
        description: 'Fee created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create fee: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateFee = useMutation({
    mutationFn: async ({ id, ...updates }: UpdatePropertyFee) => {
      const { data, error } = await supabase
        .from('property_fees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PropertyFee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Success',
        description: 'Fee updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update fee: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteFee = useMutation({
    mutationFn: async (feeId: string) => {
      const { error } = await supabase
        .from('property_fees')
        .delete()
        .eq('id', feeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Success',
        description: 'Fee deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete fee: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    fees,
    isLoading,
    error,
    createFee,
    updateFee,
    deleteFee,
  };
};
