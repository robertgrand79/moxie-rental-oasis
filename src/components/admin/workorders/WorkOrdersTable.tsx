
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import WorkOrderRow from './WorkOrderRow';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
  emailingWorkOrders: Set<string>;
  onEmailWorkOrder: (workOrder: WorkOrder) => void;
}

const WorkOrdersTable = ({
  workOrders,
  onWorkOrderClick,
  onStatusChange,
  onDeleteWorkOrder,
  emailingWorkOrders,
  onEmailWorkOrder,
}: WorkOrdersTableProps) => {
  if (workOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No work orders found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Order #</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Contractor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((workOrder) => (
            <WorkOrderRow
              key={workOrder.id}
              workOrder={workOrder}
              onWorkOrderClick={onWorkOrderClick}
              onStatusChange={onStatusChange}
              onDeleteWorkOrder={onDeleteWorkOrder}
              isEmailing={emailingWorkOrders.has(workOrder.id)}
              onEmailWorkOrder={onEmailWorkOrder}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkOrdersTable;
