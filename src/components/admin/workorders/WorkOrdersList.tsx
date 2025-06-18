
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { useWorkOrderEmail } from '@/hooks/useWorkOrderEmail';
import WorkOrdersTable from './WorkOrdersTable';

interface WorkOrdersListProps {
  workOrders: WorkOrder[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
}

const WorkOrdersList = ({
  workOrders,
  onWorkOrderClick,
  onStatusChange,
  onDeleteWorkOrder,
}: WorkOrdersListProps) => {
  const { emailingWorkOrders, handleEmailWorkOrder } = useWorkOrderEmail();

  const onEmailWorkOrder = async (workOrder: WorkOrder) => {
    await handleEmailWorkOrder(workOrder, onStatusChange);
  };

  return (
    <WorkOrdersTable
      workOrders={workOrders}
      onWorkOrderClick={onWorkOrderClick}
      onStatusChange={onStatusChange}
      onDeleteWorkOrder={onDeleteWorkOrder}
      emailingWorkOrders={emailingWorkOrders}
      onEmailWorkOrder={onEmailWorkOrder}
    />
  );
};

export default WorkOrdersList;
