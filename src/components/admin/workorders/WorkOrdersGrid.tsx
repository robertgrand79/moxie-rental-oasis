
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import WorkOrderCard from './WorkOrderCard';
import { SendMethod } from '@/hooks/useWorkOrderEmail';

interface WorkOrdersGridProps {
  workOrders: WorkOrder[];
  onWorkOrderEdit: (workOrder: WorkOrder) => void;
  onWorkOrderView?: (workOrder: WorkOrder) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
  onSendWorkOrder: (workOrder: WorkOrder, method: SendMethod) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  emailingWorkOrders: Set<string>;
  textingWorkOrders: Set<string>;
  updatingWorkOrders: Set<string>;
  selectedWorkOrders?: Set<string>;
  onSelectWorkOrder?: (workOrderId: string, selected: boolean) => void;
}

const WorkOrdersGrid = ({
  workOrders,
  onWorkOrderEdit,
  onWorkOrderView,
  onDeleteWorkOrder,
  onSendWorkOrder,
  onStatusChange,
  emailingWorkOrders,
  textingWorkOrders,
  updatingWorkOrders,
  selectedWorkOrders = new Set(),
  onSelectWorkOrder,
}: WorkOrdersGridProps) => {
  if (workOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No work orders found</h3>
        <p className="text-muted-foreground mb-6">Get started by creating your first work order.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workOrders.map((workOrder) => (
        <WorkOrderCard
          key={workOrder.id}
          workOrder={workOrder}
          onEdit={onWorkOrderEdit}
          onView={onWorkOrderView}
          onDelete={onDeleteWorkOrder}
          onSend={onSendWorkOrder}
          onStatusChange={onStatusChange}
          isEmailing={emailingWorkOrders.has(workOrder.id)}
          isTexting={textingWorkOrders.has(workOrder.id)}
          isUpdating={updatingWorkOrders.has(workOrder.id)}
          isSelected={selectedWorkOrders.has(workOrder.id)}
          onSelect={onSelectWorkOrder}
        />
      ))}
    </div>
  );
};

export default WorkOrdersGrid;
