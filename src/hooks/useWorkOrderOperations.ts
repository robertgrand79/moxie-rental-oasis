
import { useState } from 'react';
import { useWorkOrderManagement, WorkOrder } from '@/hooks/useWorkOrderManagement';
import { useWorkOrderEmail, SendMethod } from '@/hooks/useWorkOrderEmail';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrderFormData } from '@/types/mutations';

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

  const handleSaveWorkOrder = async (workOrderData: WorkOrderFormData, editingWorkOrder: WorkOrder | null) => {
    try {
      if (editingWorkOrder) {
        await updateWorkOrder(editingWorkOrder.id, workOrderData);
      } else {
        await createWorkOrder(workOrderData);
      }
    } catch (error) {
      console.error('Error saving work order:', error);
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
      const currentWorkOrder = workOrders.find(wo => wo.id === workOrderId);
      const updateData: Partial<WorkOrderFormData> = { status };
      
      if (status === 'sent' && !currentWorkOrder?.sent_at) {
        updateData.sent_at = new Date().toISOString();
      }
      if (status === 'acknowledged') {
        updateData.acknowledged_at = new Date().toISOString();
      }
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      if (status !== 'completed' && currentWorkOrder?.completed_at) {
        updateData.completed_at = null;
      }
      if (status === 'draft' && currentWorkOrder?.sent_at) {
        updateData.sent_at = null;
      }
      if ((status === 'draft' || status === 'sent') && currentWorkOrder?.acknowledged_at) {
        updateData.acknowledged_at = null;
      }
      
      await updateWorkOrder(workOrderId, updateData);
    } catch (error) {
      console.error('Error updating status:', error);
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
