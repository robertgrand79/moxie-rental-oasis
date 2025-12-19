
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
  Mail,
  MessageSquare
} from 'lucide-react';
import { SendMethod } from '@/hooks/useWorkOrderEmail';

interface WorkOrderActionsProps {
  workOrder: WorkOrder;
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
  isEmailing: boolean;
  isTexting: boolean;
  onSendWorkOrder: (workOrder: WorkOrder, method: SendMethod) => void;
}

const WorkOrderActions = ({
  workOrder,
  onWorkOrderClick,
  onDeleteWorkOrder,
  isEmailing,
  isTexting,
  onSendWorkOrder,
}: WorkOrderActionsProps) => {
  const hasEmail = !!workOrder.contractor?.email;
  const hasPhone = !!workOrder.contractor?.phone;

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
          onClick={() => onSendWorkOrder(workOrder, 'email')}
          disabled={!hasEmail || isEmailing}
        >
          <Mail className="mr-2 h-4 w-4" />
          {isEmailing ? 'Sending...' : 'Send Email'}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSendWorkOrder(workOrder, 'sms')}
          disabled={!hasPhone || isTexting}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {isTexting ? 'Sending...' : 'Send Text'}
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
