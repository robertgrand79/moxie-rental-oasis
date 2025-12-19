
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import WorkOrderRow from './WorkOrderRow';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  onPriorityChange: (workOrderId: string, priority: string) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
  emailingWorkOrders: Set<string>;
  onEmailWorkOrder: (workOrder: WorkOrder) => void;
  updatingWorkOrders?: Set<string>;
  selectedWorkOrders?: Set<string>;
  onSelectWorkOrder?: (workOrderId: string, selected: boolean) => void;
  onSelectAll?: () => void;
}

const WorkOrdersTable = ({
  workOrders,
  onWorkOrderClick,
  onStatusChange,
  onPriorityChange,
  onDeleteWorkOrder,
  emailingWorkOrders,
  onEmailWorkOrder,
  updatingWorkOrders,
  selectedWorkOrders = new Set(),
  onSelectWorkOrder,
  onSelectAll,
}: WorkOrdersTableProps) => {
  if (workOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No work orders found</p>
      </div>
    );
  }

  const allSelected = workOrders.length > 0 && selectedWorkOrders.size === workOrders.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectWorkOrder && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  className="translate-y-[2px]"
                />
              </TableHead>
            )}
            <TableHead>Work Order #</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Property</TableHead>
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
              onPriorityChange={onPriorityChange}
              onDeleteWorkOrder={onDeleteWorkOrder}
              isEmailing={emailingWorkOrders.has(workOrder.id)}
              onEmailWorkOrder={onEmailWorkOrder}
              updatingWorkOrders={updatingWorkOrders}
              isSelected={selectedWorkOrders.has(workOrder.id)}
              onSelect={onSelectWorkOrder}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkOrdersTable;
