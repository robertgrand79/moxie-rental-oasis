import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export interface WorkOrder {
  id: string;
  work_order_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  property_id?: string;
  contractor_id?: string;
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
  access_code?: string;
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
  organization_id?: string;
  name: string;
  company_name?: string;
  email: string;
  phone?: string;
  address?: string;
  specialties?: string[];
  rating?: number;
  notes?: string;
  is_active: boolean;
  sms_opt_in?: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useWorkOrderManagement = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { organization, loading: orgLoading } = useCurrentOrganization();

  const fetchWorkOrders = useCallback(async () => {
    if (!organization?.id) {
      console.log('🔄 useWorkOrderManagement - Waiting for organization...');
      setWorkOrders([]);
      return;
    }

    try {
      // First get property IDs for this organization
      const { data: orgProperties, error: propError } = await supabase
        .from('properties')
        .select('id')
        .eq('organization_id', organization.id);

      if (propError) throw propError;

      const propertyIds = orgProperties?.map(p => p.id) || [];

      if (propertyIds.length === 0) {
        setWorkOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          property:properties(*),
          contractor:contractors(*)
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkOrders(data as WorkOrder[] || []);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch work orders',
        variant: 'destructive',
      });
    }
  }, [organization?.id, toast]);

  const fetchContractors = useCallback(async () => {
    if (!organization?.id) {
      setContractors([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('organization_id', organization.id)
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
  }, [organization?.id, toast]);

  const createWorkOrder = async (workOrderData: Omit<WorkOrder, 'id' | 'work_order_number' | 'created_at' | 'updated_at' | 'created_by' | 'property' | 'contractor'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Remove fields that don't exist in the database schema or are auto-generated
      const { property, contractor, ...cleanData } = workOrderData as any;

      const { data, error } = await supabase
        .from('work_orders')
        .insert({
          ...cleanData,
          created_by: user.id
        })
        .select(`
          *,
          property:properties(*),
          contractor:contractors(*)
        `)
        .single();

      if (error) throw error;
      
      setWorkOrders(prev => [data as WorkOrder, ...prev]);
      toast({
        title: 'Success',
        description: 'Work order created successfully',
      });

      // Create notification for new work order
      if (organization?.id && data) {
        const workOrder = data as WorkOrder;
        const propertyName = workOrder.property?.title || 'Unknown Property';
        await supabase.from('admin_notifications').insert({
          organization_id: organization.id,
          user_id: null, // Notify all org admins
          notification_type: 'work_order_created',
          category: 'operations',
          title: 'New Work Order Created',
          message: `Work order "${workOrder.title}" created for ${propertyName}`,
          action_url: `/admin/work-orders`,
          priority: workOrder.priority === 'urgent' ? 'high' : 'normal',
          metadata: {
            work_order_id: workOrder.id,
            work_order_number: workOrder.work_order_number,
            property_id: workOrder.property_id,
            priority: workOrder.priority
          }
        });
      }
      
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
      // Get current work order to check status change
      const currentWorkOrder = workOrders.find(wo => wo.id === id);
      
      // Remove fields that don't belong in the database update
      const { property, contractor, ...cleanUpdates } = updates as any;

      const { data, error } = await supabase
        .from('work_orders')
        .update(cleanUpdates)
        .eq('id', id)
        .select(`
          *,
          property:properties(*),
          contractor:contractors(*)
        `)
        .single();

      if (error) throw error;
      
      setWorkOrders(prev => prev.map(wo => wo.id === id ? data as WorkOrder : wo));
      toast({
        title: 'Success',
        description: 'Work order updated successfully',
      });

      // Create notification if work order was completed
      if (organization?.id && data && currentWorkOrder?.status !== 'completed' && updates.status === 'completed') {
        const workOrder = data as WorkOrder;
        const propertyName = workOrder.property?.title || 'Unknown Property';
        await supabase.from('admin_notifications').insert({
          organization_id: organization.id,
          user_id: null,
          notification_type: 'work_order_completed',
          category: 'operations',
          title: 'Work Order Completed',
          message: `Work order "${workOrder.title}" at ${propertyName} has been completed`,
          action_url: `/admin/work-orders`,
          priority: 'normal',
          metadata: {
            work_order_id: workOrder.id,
            work_order_number: workOrder.work_order_number,
            property_id: workOrder.property_id
          }
        });
      }
      
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

  const createContractor = async (contractorData: Omit<Contractor, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      if (!organization?.id) throw new Error('Organization not loaded');

      const { data, error } = await supabase
        .from('contractors')
        .insert({
          ...contractorData,
          created_by: user.id,
          organization_id: organization.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setContractors(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Contractor created successfully',
      });
      
      return data;
    } catch (error) {
      console.error('Error creating contractor:', error);
      toast({
        title: 'Error',
        description: 'Failed to create contractor',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateContractor = async (id: string, updates: Partial<Contractor>) => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setContractors(prev => prev.map(contractor => contractor.id === id ? data : contractor));
      toast({
        title: 'Success',
        description: 'Contractor updated successfully',
      });
      
      return data;
    } catch (error) {
      console.error('Error updating contractor:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contractor',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteContractor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contractors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContractors(prev => prev.filter(contractor => contractor.id !== id));
      toast({
        title: 'Success',
        description: 'Contractor deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting contractor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contractor',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (orgLoading) return;
      setLoading(true);
      await Promise.all([fetchWorkOrders(), fetchContractors()]);
      setLoading(false);
    };
    
    loadData();
  }, [orgLoading, fetchWorkOrders, fetchContractors]);

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
    createContractor,
    updateContractor,
    deleteContractor,
    refreshData,
  };
};
