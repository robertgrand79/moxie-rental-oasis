
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  User, 
  Building, 
  Edit, 
  Trash2, 
  Send,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SendMethod } from '@/hooks/useWorkOrderEmail';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onEdit: (workOrder: WorkOrder) => void;
  onDelete: (workOrderId: string) => void;
  onSend: (workOrder: WorkOrder, method: SendMethod) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  isEmailing: boolean;
  isTexting: boolean;
  isUpdating: boolean;
  isSelected?: boolean;
  onSelect?: (workOrderId: string, selected: boolean) => void;
}

const WorkOrderCard = ({
  workOrder,
  onEdit,
  onDelete,
  onSend,
  onStatusChange,
  isEmailing,
  isTexting,
  isUpdating,
  isSelected = false,
  onSelect,
}: WorkOrderCardProps) => {
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

  const handleStatusClick = (newStatus: string) => {
    if (newStatus !== workOrder.status && !isUpdating) {
      onStatusChange(workOrder.id, newStatus);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(workOrder.id, checked);
  };

  const hasEmail = !!workOrder.contractor?.email;
  const hasPhone = !!workOrder.contractor?.phone;
  const canSend = hasEmail || hasPhone;
  const isSending = isEmailing || isTexting;

  const priority = workOrder.priority as keyof typeof priorityConfig;
  const status = workOrder.status as keyof typeof statusConfig;

  return (
    <div 
      className={cn(
        "group bg-card border rounded-xl p-4 transition-all hover:shadow-md hover:border-primary/20",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {onSelect && (
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleCheckboxChange}
                className="h-4 w-4"
              />
            </div>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {workOrder.work_order_number}
          </span>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", priorityConfig[priority]?.dot)} />
            <span className={cn("text-xs font-medium capitalize", priorityConfig[priority]?.text)}>
              {workOrder.priority}
            </span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-7 w-7 p-0 transition-opacity",
                statusConfig[status]?.bg,
                statusConfig[status]?.text
              )}
            >
              <span className="text-xs font-medium capitalize mr-0.5">
                {workOrder.status.replace('_', ' ')}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.keys(statusConfig).map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => handleStatusClick(s)}
                disabled={isUpdating}
                className={workOrder.status === s ? 'bg-muted' : ''}
              >
                <span className="capitalize">{s.replace('_', ' ')}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <h3 className="font-medium text-foreground mb-3 line-clamp-2">
        {workOrder.title}
      </h3>

      {/* Metadata */}
      <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
        {workOrder.contractor && (
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {workOrder.contractor.name}
              {workOrder.contractor.company_name && (
                <span className="opacity-70"> ({workOrder.contractor.company_name})</span>
              )}
            </span>
          </div>
        )}
        
        {workOrder.property && (
          <div className="flex items-center gap-2">
            <Building className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{workOrder.property.title}</span>
          </div>
        )}
        
        {workOrder.estimated_completion_date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Due {format(new Date(workOrder.estimated_completion_date), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEdit(workOrder)}
          className="h-8 text-muted-foreground hover:text-foreground"
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Edit
        </Button>
        
        <div className="flex items-center gap-1">
          {canSend && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isSending}
                  className="h-8"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  {isSending ? 'Sending...' : 'Send'}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasEmail && (
                  <DropdownMenuItem 
                    onClick={() => onSend(workOrder, 'email')}
                    disabled={isEmailing}
                  >
                    Send Email
                  </DropdownMenuItem>
                )}
                {hasPhone && (
                  <DropdownMenuItem 
                    onClick={() => onSend(workOrder, 'sms')}
                    disabled={isTexting}
                  >
                    Send Text
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(workOrder)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(workOrder.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderCard;
