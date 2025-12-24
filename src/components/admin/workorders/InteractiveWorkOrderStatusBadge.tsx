
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCircle, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { debug } from '@/utils/debug';

interface InteractiveWorkOrderStatusBadgeProps {
  status: string;
  workOrderId: string;
  onStatusChange: (workOrderId: string, status: string) => void;
  isUpdating?: boolean;
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  acknowledged: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  invoiced: 'bg-indigo-100 text-indigo-800',
  paid: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'in_progress':
      return <Clock className="h-4 w-4" />;
    case 'cancelled':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

const InteractiveWorkOrderStatusBadge = ({
  status,
  workOrderId,
  onStatusChange,
  isUpdating = false,
}: InteractiveWorkOrderStatusBadgeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (newStatus: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    debug.log('[WorkOrders]', 'Status change clicked:', { workOrderId, currentStatus: status, newStatus });
    
    if (newStatus !== status && !isUpdating) {
      try {
        await onStatusChange(workOrderId, newStatus);
        debug.log('[WorkOrders]', 'Status change successful');
      } catch (error) {
        debug.error('[WorkOrders]', 'Status change failed:', error);
      }
    }
    setIsOpen(false);
  };

  const handleBadgeClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    debug.log('[WorkOrders]', 'Badge clicked for work order:', workOrderId);
    setIsOpen(!isOpen);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Badge 
          className={`${statusColors[status as keyof typeof statusColors]} flex items-center gap-1 w-fit cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={handleBadgeClick}
        >
          {getStatusIcon(status)}
          {status.replace('_', ' ')}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-40 !bg-white border shadow-lg !z-[9999] opacity-100"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 9999, backgroundColor: 'white' }}
      >
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={(e) => handleStatusChange(option.value, e)}
            className={`cursor-pointer hover:bg-gray-100 ${status === option.value ? 'bg-gray-100 font-medium' : ''}`}
            disabled={isUpdating}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InteractiveWorkOrderStatusBadge;
