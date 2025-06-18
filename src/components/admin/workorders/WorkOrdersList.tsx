
import React, { useState } from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { useWorkOrderEmail } from '@/hooks/useWorkOrderEmail';
import { useToast } from '@/hooks/use-toast';
import WorkOrdersTable from './WorkOrdersTable';

interface WorkOrdersListProps {
  workOrders: WorkOrder[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
  onUpdateWorkOrder: (workOrderId: string, updates: Partial<WorkOrder>) => Promise<WorkOrder>;
}

const WorkOrdersList = ({
  workOrders,
  onWorkOrderClick,
  onStatusChange,
  onDeleteWorkOrder,
  onUpdateWorkOrder,
}: WorkOrdersListProps) => {
  const { emailingWorkOrders, handleEmailWorkOrder } = useWorkOrderEmail();
  const [updatingWorkOrders, setUpdatingWorkOrders] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const onEmailWorkOrder = async (workOrder: WorkOrder) => {
    await handleEmailWorkOrder(workOrder, onStatusChange);
  };

  const handlePriorityChange = async (workOrderId: string, priority: string) => {
    if (updatingWorkOrders.has(workOrderId)) {
      return;
    }

    setUpdatingWorkOrders(prev => new Set([...prev, workOrderId]));

    try {
      await onUpdateWorkOrder(workOrderId, { priority });
      toast({
        title: 'Success',
        description: 'Work order priority updated successfully',
      });
    } catch (error) {
      console.error('Error updating work order priority:', error);
      toast({
        title: 'Error',
        description: 'Failed to update work order priority',
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

  return (
    <WorkOrdersTable
      workOrders={workOrders}
      onWorkOrderClick={onWorkOrderClick}
      onStatusChange={onStatusChange}
      onPriorityChange={handlePriorityChange}
      onDeleteWorkOrder={onDeleteWorkOrder}
      emailingWorkOrders={emailingWorkOrders}
      onEmailWorkOrder={onEmailWorkOrder}
      updatingWorkOrders={updatingWorkOrders}
    />
  );
};

export default WorkOrdersList;
