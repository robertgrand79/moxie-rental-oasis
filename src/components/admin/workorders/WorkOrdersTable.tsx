
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
import { SendMethod } from '@/hooks/useWorkOrderEmail';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  onPriorityChange: (workOrderId: string, priority: string) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
  emailingWorkOrders: Set<string>;
  textingWorkOrders: Set<string>;
  onSendWorkOrder: (workOrder: WorkOrder, method: SendMethod) => void;
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
  textingWorkOrders,
  onSendWorkOrder,
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
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {onSelectWorkOrder && (
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="w-24">WO #</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Contractor</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-24">Priority</TableHead>
            <TableHead className="w-20">Due</TableHead>
            <TableHead className="w-12"></TableHead>
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
              isTexting={textingWorkOrders.has(workOrder.id)}
              onSendWorkOrder={onSendWorkOrder}
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
