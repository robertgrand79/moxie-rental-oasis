
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { workOrderService } from '@/services/workOrderService';

export interface WorkOrder {
  id: string;
  property_id?: string;
  contractor_id?: string;
  work_order_number: string;
  title: string;
  description: string;
  scope_of_work?: string;
  priority: string;
  status: string;
  estimated_cost?: number;
  actual_cost?: number;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  sent_at?: string;
  acknowledged_at?: string;
  completed_at?: string;
  requires_permits?: boolean;
  special_instructions?: string;
  attachments?: string[];
  completion_photos?: string[];
  invoice_attachments?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  contractor?: any;
  property?: any;
}

export const useWorkOrderOperations = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const { toast } = useToast();

  const fetchWorkOrders = async () => {
    try {
      const data = await workOrderService.fetchAll();
      setWorkOrders(data);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch work orders',
        variant: 'destructive',
      });
    }
  };

  const createWorkOrder = async (workOrderData: Omit<WorkOrder, 'id' | 'work_order_number' | 'created_at' | 'updated_at' | 'created_by' | 'contractor' | 'property'>) => {
    try {
      const data = await workOrderService.create(workOrderData);
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

  const updateWorkOrder = async (workOrderId: string, updates: Partial<WorkOrder>) => {
    try {
      const data = await workOrderService.update(workOrderId, updates);
      setWorkOrders(prev => prev.map(wo => 
        wo.id === workOrderId ? data : wo
      ));
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

  const deleteWorkOrder = async (workOrderId: string) => {
    try {
      await workOrderService.delete(workOrderId);
      setWorkOrders(prev => prev.filter(wo => wo.id !== workOrderId));
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

  return {
    workOrders,
    setWorkOrders,
    fetchWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
  };
};
