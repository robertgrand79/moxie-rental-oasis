
import { supabase } from '@/integrations/supabase/client';
import { Contractor } from '@/hooks/useWorkOrderManagement';

export const contractorService = {
  async fetchAll() {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(contractorData: Omit<Contractor, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('contractors')
      .insert([{ ...contractorData, created_by: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(contractorId: string, updates: Partial<Contractor>) {
    const { data, error } = await supabase
      .from('contractors')
      .update(updates)
      .eq('id', contractorId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(contractorId: string) {
    const { error } = await supabase
      .from('contractors')
      .delete()
      .eq('id', contractorId);

    if (error) throw error;
  }
};
