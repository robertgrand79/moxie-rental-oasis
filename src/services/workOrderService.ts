
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

export const workOrderService = {
  async fetchAll() {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        contractor:contractors(*),
        property:properties(*),
        task:tasks(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(workOrderData: Omit<WorkOrder, 'id' | 'work_order_number' | 'created_at' | 'updated_at' | 'created_by' | 'contractor' | 'property' | 'task'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('work_orders')
      .insert([{ 
        ...workOrderData, 
        created_by: user.id,
        work_order_number: '' // This will trigger auto-generation via database trigger
      }])
      .select(`
        *,
        contractor:contractors(*),
        property:properties(*),
        task:tasks(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async update(workOrderId: string, updates: Partial<WorkOrder>) {
    const { data, error } = await supabase
      .from('work_orders')
      .update(updates)
      .eq('id', workOrderId)
      .select(`
        *,
        contractor:contractors(*),
        property:properties(*),
        task:tasks(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async delete(workOrderId: string) {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', workOrderId);

    if (error) throw error;
  }
};
