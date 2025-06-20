
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import WorkOrderCard from './WorkOrderCard';

interface WorkOrdersGridProps {
  workOrders: WorkOrder[];
  onWorkOrderEdit: (workOrder: WorkOrder) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
  onEmailWorkOrder: (workOrder: WorkOrder) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  emailingWorkOrders: Set<string>;
  updatingWorkOrders: Set<string>;
}

const WorkOrdersGrid = ({
  workOrders,
  onWorkOrderEdit,
  onDeleteWorkOrder,
  onEmailWorkOrder,
  onStatusChange,
  emailingWorkOrders,
  updatingWorkOrders,
}: WorkOrdersGridProps) => {
  if (workOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
        <p className="text-gray-500 mb-6">Get started by creating your first work order.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workOrders.map((workOrder) => (
        <WorkOrderCard
          key={workOrder.id}
          workOrder={workOrder}
          onEdit={onWorkOrderEdit}
          onDelete={onDeleteWorkOrder}
          onEmail={onEmailWorkOrder}
          onStatusChange={onStatusChange}
          isEmailing={emailingWorkOrders.has(workOrder.id)}
          isUpdating={updatingWorkOrders.has(workOrder.id)}
        />
      ))}
    </div>
  );
};

export default WorkOrdersGrid;
