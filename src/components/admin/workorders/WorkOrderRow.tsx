
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import InteractiveWorkOrderStatusBadge from './InteractiveWorkOrderStatusBadge';
import InteractiveWorkOrderPriorityBadge from './InteractiveWorkOrderPriorityBadge';
import WorkOrderActions from './WorkOrderActions';
import { cn } from '@/lib/utils';

interface WorkOrderRowProps {
  workOrder: WorkOrder;
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  onPriorityChange: (workOrderId: string, priority: string) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
  isEmailing: boolean;
  onEmailWorkOrder: (workOrder: WorkOrder) => void;
  updatingWorkOrders?: Set<string>;
  isSelected?: boolean;
  onSelect?: (workOrderId: string, selected: boolean) => void;
}

const WorkOrderRow = ({
  workOrder,
  onWorkOrderClick,
  onStatusChange,
  onPriorityChange,
  onDeleteWorkOrder,
  isEmailing,
  onEmailWorkOrder,
  updatingWorkOrders = new Set(),
  isSelected = false,
  onSelect,
}: WorkOrderRowProps) => {
  const isUpdating = updatingWorkOrders.has(workOrder.id);

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(workOrder.id, checked);
  };

  return (
    <TableRow 
      className={cn(
        "cursor-pointer hover:bg-gray-50",
        isSelected && "bg-primary/5"
      )}
      onClick={() => onWorkOrderClick(workOrder)}
    >
      {onSelect && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="translate-y-[2px]"
          />
        </TableCell>
      )}
      <TableCell className="font-medium">
        {workOrder.work_order_number}
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {workOrder.title}
      </TableCell>
      <TableCell>
        {workOrder.property?.title || 'No property'}
      </TableCell>
      <TableCell>
        {workOrder.contractor ? (
          <div>
            <div className="font-medium">{workOrder.contractor.name}</div>
            <div className="text-sm text-gray-500">{workOrder.contractor.company_name}</div>
          </div>
        ) : (
          'Unassigned'
        )}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <InteractiveWorkOrderStatusBadge
          status={workOrder.status}
          workOrderId={workOrder.id}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
        />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <InteractiveWorkOrderPriorityBadge
          priority={workOrder.priority}
          workOrderId={workOrder.id}
          onPriorityChange={onPriorityChange}
          isUpdating={isUpdating}
        />
      </TableCell>
      <TableCell>
        {workOrder.estimated_completion_date 
          ? format(new Date(workOrder.estimated_completion_date), 'MMM dd, yyyy')
          : 'Not set'
        }
      </TableCell>
      <TableCell>
        {format(new Date(workOrder.created_at), 'MMM dd, yyyy')}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <WorkOrderActions
          workOrder={workOrder}
          onWorkOrderClick={onWorkOrderClick}
          onDeleteWorkOrder={onDeleteWorkOrder}
          isEmailing={isEmailing}
          onEmailWorkOrder={onEmailWorkOrder}
        />
      </TableCell>
    </TableRow>
  );
};

export default WorkOrderRow;
