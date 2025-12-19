
import { useState } from 'react';
import { useWorkOrderManagement, WorkOrder } from '@/hooks/useWorkOrderManagement';
import { useWorkOrderEmail, SendMethod } from '@/hooks/useWorkOrderEmail';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useWorkOrderOperations = () => {
  const {
    workOrders,
    contractors,
    loading,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    refreshData,
  } = useWorkOrderManagement();

  const { 
    emailingWorkOrders, 
    textingWorkOrders,
    handleSendWorkOrder: sendWorkOrder 
  } = useWorkOrderEmail();
  const { toast } = useToast();

  const [updatingWorkOrders, setUpdatingWorkOrders] = useState<Set<string>>(new Set());

  const handleSaveWorkOrder = async (workOrderData: any, editingWorkOrder: WorkOrder | null) => {
    try {
      if (editingWorkOrder) {
        await updateWorkOrder(editingWorkOrder.id, workOrderData);
        toast({
          title: 'Success',
          description: 'Work order updated successfully',
        });
      } else {
        await createWorkOrder(workOrderData);
        toast({
          title: 'Success',
          description: 'Work order created successfully',
        });
      }
    } catch (error) {
      console.error('Error saving work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to save work order. Please try again.',
        variant: 'destructive',
      });
      // Re-throw the error so the calling component knows the operation failed
      throw error;
    }
  };

  const handleDeleteWorkOrder = async (workOrderId: string) => {
    if (confirm('Are you sure you want to delete this work order?')) {
      await deleteWorkOrder(workOrderId);
    }
  };

  const handleStatusChange = async (workOrderId: string, status: string) => {
    if (updatingWorkOrders.has(workOrderId)) return;

    setUpdatingWorkOrders(prev => new Set([...prev, workOrderId]));

    try {
      const updateData: any = { status };
      
      if (status === 'sent' && !workOrders.find(wo => wo.id === workOrderId)?.sent_at) {
        updateData.sent_at = new Date().toISOString();
      }
      if (status === 'acknowledged') {
        updateData.acknowledged_at = new Date().toISOString();
      }
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      await updateWorkOrder(workOrderId, updateData);
      
      
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingWorkOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(workOrderId);
        return newSet;
      });
    }
  };

  const handleSendWorkOrder = async (workOrder: WorkOrder, method: SendMethod = 'both') => {
    await sendWorkOrder(workOrder, handleStatusChange, method);
  };

  // Legacy function for backwards compatibility
  const handleEmailWorkOrder = async (workOrder: WorkOrder) => {
    await sendWorkOrder(workOrder, handleStatusChange, 'both');
  };

  return {
    workOrders,
    contractors,
    loading,
    emailingWorkOrders,
    textingWorkOrders,
    updatingWorkOrders,
    handleSaveWorkOrder,
    handleDeleteWorkOrder,
    handleStatusChange,
    handleSendWorkOrder,
    handleEmailWorkOrder,
    refreshData,
  };
};
