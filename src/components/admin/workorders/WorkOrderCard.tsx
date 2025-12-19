
import React from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { EnhancedCard, EnhancedCardContent, EnhancedCardFooter, EnhancedCardHeader } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  User, 
  Building, 
  Edit, 
  Trash2, 
  Mail, 
  Clock,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  MessageSquare
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
  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    acknowledged: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    invoiced: 'bg-indigo-100 text-indigo-800',
    paid: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'critical' || priority === 'high') {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <CheckCircle2 className="h-4 w-4" />;
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

  return (
    <EnhancedCard 
      variant="elevated" 
      hover={true}
      className={cn(
        "group relative overflow-hidden transition-all",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <div 
          className="absolute top-3 left-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="h-5 w-5 bg-white border-2 shadow-sm"
          />
        </div>
      )}

      {/* Priority indicator stripe */}
      <div className={`absolute top-0 left-0 w-1 h-full ${
        workOrder.priority === 'critical' ? 'bg-red-500' :
        workOrder.priority === 'high' ? 'bg-orange-500' :
        workOrder.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
      }`} />

      <EnhancedCardHeader className={cn("pb-3", onSelect && "pl-10")}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs flex-shrink-0">
                {workOrder.work_order_number}
              </Badge>
              <Badge className={`${priorityColors[workOrder.priority as keyof typeof priorityColors]} flex-shrink-0`}>
                {getPriorityIcon(workOrder.priority)}
                <span className="ml-1 capitalize">{workOrder.priority}</span>
              </Badge>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {workOrder.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {workOrder.description}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(workOrder)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onSend(workOrder, 'email')}
                disabled={!hasEmail || isEmailing}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isEmailing ? 'Sending...' : 'Send Email'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onSend(workOrder, 'sms')}
                disabled={!hasPhone || isTexting}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {isTexting ? 'Sending...' : 'Send Text'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(workOrder.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </EnhancedCardHeader>

      <EnhancedCardContent className={cn("space-y-4", onSelect && "pl-10")}>
        {/* Status with quick actions */}
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge 
                className={`${statusColors[workOrder.status as keyof typeof statusColors]} cursor-pointer hover:opacity-80 transition-opacity`}
                variant="outline"
              >
                {workOrder.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(statusColors).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusClick(status)}
                  disabled={isUpdating}
                  className={workOrder.status === status ? 'bg-gray-100' : ''}
                >
                  <Badge className={statusColors[status as keyof typeof statusColors]}>
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          {workOrder.contractor && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {workOrder.contractor.name}
                {workOrder.contractor.company_name && (
                  <span className="text-gray-500 ml-1">({workOrder.contractor.company_name})</span>
                )}
              </span>
            </div>
          )}
          
          {workOrder.property && (
            <div className="flex items-center gap-2 text-gray-600">
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{workOrder.property.title}</span>
            </div>
          )}
          
          {workOrder.estimated_completion_date && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Due {format(new Date(workOrder.estimated_completion_date), 'MMM dd, yyyy')}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>Created {format(new Date(workOrder.created_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </EnhancedCardContent>

      <EnhancedCardFooter className={cn("pt-3 border-t", onSelect && "pl-10")}>
        <div className="flex items-center justify-between w-full gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(workOrder)}
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
          
          <div className="flex items-center gap-1">
            {hasEmail && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSend(workOrder, 'email')}
                disabled={isEmailing}
                className="flex items-center gap-1"
                title="Send via Email"
              >
                <Mail className="h-3 w-3" />
                {isEmailing ? '...' : 'Email'}
              </Button>
            )}
            
            {hasPhone && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSend(workOrder, 'sms')}
                disabled={isTexting}
                className="flex items-center gap-1"
                title="Send via Text"
              >
                <MessageSquare className="h-3 w-3" />
                {isTexting ? '...' : 'Text'}
              </Button>
            )}
          </div>
        </div>
      </EnhancedCardFooter>
    </EnhancedCard>
  );
};

export default WorkOrderCard;
