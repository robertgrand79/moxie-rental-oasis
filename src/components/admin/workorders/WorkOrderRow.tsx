
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SendMethod } from '@/hooks/useWorkOrderEmail';
import { MoreHorizontal, Mail, MessageSquare, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WorkOrderRowProps {
  workOrder: WorkOrder;
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  onPriorityChange: (workOrderId: string, priority: string) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
  isEmailing: boolean;
  isTexting: boolean;
  onSendWorkOrder: (workOrder: WorkOrder, method: SendMethod) => void;
  updatingWorkOrders?: Set<string>;
  isSelected?: boolean;
  onSelect?: (workOrderId: string, selected: boolean) => void;
}

const priorityConfig = {
  low: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  medium: { dot: 'bg-amber-500', text: 'text-amber-700' },
  high: { dot: 'bg-orange-500', text: 'text-orange-700' },
  critical: { dot: 'bg-red-500', text: 'text-red-700' },
};

const statusConfig = {
  draft: { bg: 'bg-muted', text: 'text-muted-foreground' },
  sent: { bg: 'bg-blue-50', text: 'text-blue-700' },
  acknowledged: { bg: 'bg-purple-50', text: 'text-purple-700' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  invoiced: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
};

const WorkOrderRow = ({
  workOrder,
  onWorkOrderClick,
  onStatusChange,
  onPriorityChange,
  onDeleteWorkOrder,
  isEmailing,
  isTexting,
  onSendWorkOrder,
  updatingWorkOrders = new Set(),
  isSelected = false,
  onSelect,
}: WorkOrderRowProps) => {
  const isUpdating = updatingWorkOrders.has(workOrder.id);
  const hasEmail = !!workOrder.contractor?.email;
  const hasPhone = !!workOrder.contractor?.phone;
  const canSend = hasEmail || hasPhone;
  const isSending = isEmailing || isTexting;

  const priority = workOrder.priority as keyof typeof priorityConfig;
  const status = workOrder.status as keyof typeof statusConfig;

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(workOrder.id, checked);
  };

  const handleStatusClick = (newStatus: string) => {
    if (newStatus !== workOrder.status && !isUpdating) {
      onStatusChange(workOrder.id, newStatus);
    }
  };

  return (
    <TableRow 
      className={cn(
        "cursor-pointer hover:bg-muted/50",
        isSelected && "bg-primary/5"
      )}
      onClick={() => onWorkOrderClick(workOrder)}
    >
      {onSelect && (
        <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
          />
        </TableCell>
      )}
      
      <TableCell className="font-mono text-xs text-muted-foreground">
        {workOrder.work_order_number}
      </TableCell>
      
      <TableCell className="max-w-[200px]">
        <span className="font-medium truncate block">{workOrder.title}</span>
      </TableCell>
      
      <TableCell className="text-muted-foreground">
        {workOrder.property?.title || '—'}
      </TableCell>
      
      <TableCell>
        {workOrder.contractor ? (
          <span className="text-sm">{workOrder.contractor.name}</span>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )}
      </TableCell>
      
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className={cn(
                "px-2 py-1 rounded text-xs font-medium capitalize",
                statusConfig[status]?.bg,
                statusConfig[status]?.text
              )}
            >
              {workOrder.status.replace('_', ' ')}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.keys(statusConfig).map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => handleStatusClick(s)}
                disabled={isUpdating}
              >
                <span className="capitalize">{s.replace('_', ' ')}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", priorityConfig[priority]?.dot)} />
          <span className={cn("text-xs capitalize", priorityConfig[priority]?.text)}>
            {workOrder.priority}
          </span>
        </div>
      </TableCell>
      
      <TableCell className="text-muted-foreground text-sm">
        {workOrder.estimated_completion_date 
          ? format(new Date(workOrder.estimated_completion_date), 'MMM d')
          : '—'
        }
      </TableCell>
      
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          {/* Email button - always visible */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onSendWorkOrder(workOrder, 'email')}
                  disabled={isEmailing || !hasEmail}
                  className="h-8 w-8 p-0"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {!hasEmail 
                ? (!workOrder.contractor ? 'Assign a contractor first' : 'Contractor has no email')
                : 'Send Email'
              }
            </TooltipContent>
          </Tooltip>
          
          {/* Text button - always visible */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onSendWorkOrder(workOrder, 'sms')}
                  disabled={isTexting || !hasPhone}
                  className="h-8 w-8 p-0"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {!hasPhone 
                ? (!workOrder.contractor ? 'Assign a contractor first' : 'Contractor has no phone')
                : 'Send Text'
              }
            </TooltipContent>
          </Tooltip>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onWorkOrderClick(workOrder)}>
                View / Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDeleteWorkOrder(workOrder.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default WorkOrderRow;
