
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

export const workOrderService = {
  async fetchAll() {
    console.log('Fetching all work orders...');
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        contractor:contractors(*),
        property:properties(*),
        task:tasks(*),
        project:property_projects(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }
    
    console.log('Fetched work orders:', data?.length || 0);
    return data || [];
  },

  async create(workOrderData: Omit<WorkOrder, 'id' | 'work_order_number' | 'created_at' | 'updated_at' | 'created_by' | 'contractor' | 'property' | 'task' | 'project'>) {
    console.log('Creating work order with data:', workOrderData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Remove pricing and permit fields from the data being sent
    const { estimated_cost, actual_cost, requires_permits, ...cleanData } = workOrderData as any;

    const insertData = { 
      ...cleanData, 
      created_by: user.id,
      work_order_number: '' // This will trigger auto-generation via database trigger
    };
    
    console.log('Inserting work order data:', insertData);

    const { data, error } = await supabase
      .from('work_orders')
      .insert([insertData])
      .select(`
        *,
        contractor:contractors(*),
        property:properties(*),
        task:tasks(*),
        project:property_projects(*)
      `)
      .single();

    if (error) {
      console.error('Error creating work order:', error);
      throw error;
    }
    
    console.log('Created work order:', data);
    return data;
  },

  async update(workOrderId: string, updates: Partial<WorkOrder>) {
    console.log('Updating work order:', { workOrderId, updates });
    
    // Remove pricing and permit fields from updates
    const { estimated_cost, actual_cost, requires_permits, ...cleanUpdates } = updates as any;

    console.log('Clean updates being sent to database:', cleanUpdates);

    const { data, error } = await supabase
      .from('work_orders')
      .update(cleanUpdates)
      .eq('id', workOrderId)
      .select(`
        *,
        contractor:contractors(*),
        property:properties(*),
        task:tasks(*),
        project:property_projects(*)
      `)
      .single();

    if (error) {
      console.error('Error updating work order:', error);
      throw error;
    }
    
    console.log('Updated work order:', data);
    return data;
  },

  async delete(workOrderId: string) {
    console.log('Deleting work order:', workOrderId);
    
    // Delete associated files from storage
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('work-order-files')
        .list(workOrderId);

      if (!listError && files && files.length > 0) {
        const filePaths = files.map(file => `${workOrderId}/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('work-order-files')
          .remove(filePaths);
        
        if (deleteError) {
          console.warn('Error deleting work order files:', deleteError);
        } else {
          console.log('Deleted work order files:', filePaths.length);
        }
      }
    } catch (error) {
      console.warn('Error cleaning up work order files:', error);
    }
    
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', workOrderId);

    if (error) {
      console.error('Error deleting work order:', error);
      throw error;
    }
    
    console.log('Deleted work order successfully');
  }
};
