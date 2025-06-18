import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { contractorService } from '@/services/contractorService';
import { workOrderService } from '@/services/workOrderService';

export interface Contractor {
  id: string;
  name: string;
  company_name?: string;
  email: string;
  phone?: string;
  specialties?: string[];
  address?: string;
  rating?: number;
  is_active: boolean;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  id: string;
  task_id?: string;
  property_id?: string;
  project_id?: string; // Add project_id field
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
  contractor?: Contractor;
  property?: any;
  task?: any;
  project?: any; // Add project relationship
}

export const useWorkOrderManagement = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContractors = async () => {
    try {
      const data = await contractorService.fetchAll();
      setContractors(data);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch contractors',
        variant: 'destructive',
      });
    }
  };

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

  const createContractor = async (contractorData: Omit<Contractor, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const data = await contractorService.create(contractorData);
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

  const createWorkOrder = async (workOrderData: Omit<WorkOrder, 'id' | 'work_order_number' | 'created_at' | 'updated_at' | 'created_by' | 'contractor' | 'property' | 'task' | 'project'>) => {
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

  const updateContractor = async (contractorId: string, updates: Partial<Contractor>) => {
    try {
      const data = await contractorService.update(contractorId, updates);
      setContractors(prev => prev.map(contractor => 
        contractor.id === contractorId ? data : contractor
      ));
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

  const deleteContractor = async (contractorId: string) => {
    try {
      await contractorService.delete(contractorId);
      setContractors(prev => prev.filter(contractor => contractor.id !== contractorId));
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
      setLoading(true);
      await Promise.all([fetchContractors(), fetchWorkOrders()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    workOrders,
    contractors,
    loading,
    createContractor,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    updateContractor,
    deleteContractor,
    refreshData: () => Promise.all([fetchContractors(), fetchWorkOrders()]),
  };
};
