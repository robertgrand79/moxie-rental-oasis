
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

  const handleStatusChange = async (workOrderId: string, status: string) => {
    console.log('Handling status change:', { workOrderId, status });
    
    if (updatingWorkOrders.has(workOrderId)) {
      console.log('Update already in progress, skipping');
      return;
    }

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
      
      console.log('Updating work order with data:', updateData);
      await onUpdateWorkOrder(workOrderId, updateData);
      
      console.log('Status update successful');
      toast({
        title: 'Success',
        description: 'Work order status updated successfully',
      });
    } catch (error) {
      console.error('Error updating work order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update work order status',
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

  const handlePriorityChange = async (workOrderId: string, priority: string) => {
    console.log('Handling priority change:', { workOrderId, priority });
    
    if (updatingWorkOrders.has(workOrderId)) {
      console.log('Update already in progress, skipping');
      return;
    }

    setUpdatingWorkOrders(prev => new Set([...prev, workOrderId]));

    try {
      console.log('Updating work order priority');
      await onUpdateWorkOrder(workOrderId, { priority });
      
      console.log('Priority update successful');
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
      onStatusChange={handleStatusChange}
      onPriorityChange={handlePriorityChange}
      onDeleteWorkOrder={onDeleteWorkOrder}
      emailingWorkOrders={emailingWorkOrders}
      onEmailWorkOrder={onEmailWorkOrder}
      updatingWorkOrders={updatingWorkOrders}
    />
  );
};

export default WorkOrdersList;
