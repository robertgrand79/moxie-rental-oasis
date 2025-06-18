
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkOrder {
  id: string;
  work_order_number: string;
  title: string;
  description: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  property_id?: string;
  contractor_id?: string;
  task_id?: string;
  estimated_cost?: number;
  actual_cost?: number;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  scope_of_work?: string;
  special_instructions?: string;
  attachments?: string[];
  completion_photos?: string[];
  invoice_attachments?: string[];
  requires_permits?: boolean;
  sent_at?: string;
  acknowledged_at?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    title: string;
    location: string;
  };
  contractor?: {
    id: string;
    name: string;
    company_name?: string;
    email: string;
    phone?: string;
  };
}

export interface Contractor {
  id: string;
  name: string;
  company_name?: string;
  email: string;
  phone?: string;
  address?: string;
  specialties?: string[];
  rating?: number;
  notes?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useWorkOrderManagement = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          property:properties(*),
          contractor:contractors(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkOrders(data || []);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch work orders',
        variant: 'destructive',
      });
    }
  };

  const fetchContractors = async () => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch contractors',
        variant: 'destructive',
      });
    }
  };

  const createWorkOrder = async (workOrderData: Omit<WorkOrder, 'id' | 'work_order_number' | 'created_at' | 'updated_at' | 'created_by' | 'property' | 'contractor'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('work_orders')
        .insert([{ ...workOrderData, created_by: user.id }])
        .select(`
          *,
          property:properties(*),
          contractor:contractors(*)
        `)
        .single();

      if (error) throw error;
      
      setWorkOrders(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Work order created successfully',
      });
      
      return data;
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create work order',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          property:properties(*),
          contractor:contractors(*)
        `)
        .single();

      if (error) throw error;
      
      setWorkOrders(prev => prev.map(wo => wo.id === id ? data : wo));
      toast({
        title: 'Success',
        description: 'Work order updated successfully',
      });
      
      return data;
    } catch (error) {
      console.error('Error updating work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update work order',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteWorkOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setWorkOrders(prev => prev.filter(wo => wo.id !== id));
      toast({
        title: 'Success',
        description: 'Work order deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete work order',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchWorkOrders(), fetchContractors()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const refreshData = () => {
    fetchWorkOrders();
    fetchContractors();
  };

  return {
    workOrders,
    contractors,
    loading,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    refreshData,
  };
};
