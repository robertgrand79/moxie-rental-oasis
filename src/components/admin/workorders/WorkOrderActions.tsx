
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Send
} from 'lucide-react';

interface WorkOrderActionsProps {
  workOrder: WorkOrder;
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
  isEmailing: boolean;
  onEmailWorkOrder: (workOrder: WorkOrder) => void;
}

const WorkOrderActions = ({
  workOrder,
  onWorkOrderClick,
  onDeleteWorkOrder,
  isEmailing,
  onEmailWorkOrder,
}: WorkOrderActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onWorkOrderClick(workOrder)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onWorkOrderClick(workOrder)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onEmailWorkOrder(workOrder)}
          disabled={!workOrder.contractor?.email || isEmailing}
        >
          <Send className="mr-2 h-4 w-4" />
          {isEmailing ? 'Sending...' : (
            <span>
              Send
              {workOrder.contractor?.phone && (
                <span className="text-xs text-muted-foreground ml-1">(Email + SMS)</span>
              )}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDeleteWorkOrder(workOrder.id)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WorkOrderActions;
