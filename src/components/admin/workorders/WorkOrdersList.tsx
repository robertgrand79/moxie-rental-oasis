import React, { useState } from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkOrdersListProps {
  workOrders: WorkOrder[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
}

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

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const WorkOrdersList = ({
  workOrders,
  onWorkOrderClick,
  onStatusChange,
  onDeleteWorkOrder,
}: WorkOrdersListProps) => {
  const [emailingWorkOrders, setEmailingWorkOrders] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleEmailWorkOrder = async (workOrder: WorkOrder) => {
    if (!workOrder.contractor?.email) {
      toast({
        title: 'Error',
        description: 'This work order has no contractor email assigned',
        variant: 'destructive',
      });
      return;
    }

    setEmailingWorkOrders(prev => new Set(prev).add(workOrder.id));

    try {
      const { data, error } = await supabase.functions.invoke('send-work-order-pdf', {
        body: { workOrderId: workOrder.id }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Work order PDF sent to ${workOrder.contractor.email}`,
      });

      // If status was draft, it will be updated to sent by the edge function
      if (workOrder.status === 'draft') {
        onStatusChange(workOrder.id, 'sent');
      }
    } catch (error) {
      console.error('Error sending work order PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to send work order PDF',
        variant: 'destructive',
      });
    } finally {
      setEmailingWorkOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(workOrder.id);
        return newSet;
      });
    }
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
            <TableRow 
              key={workOrder.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onWorkOrderClick(workOrder)}
            >
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
                {workOrder.project?.title || 'No project'}
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
              <TableCell>
                <Badge className={`${statusColors[workOrder.status as keyof typeof statusColors]} flex items-center gap-1 w-fit`}>
                  {getStatusIcon(workOrder.status)}
                  {workOrder.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[workOrder.priority as keyof typeof priorityColors]}>
                  {workOrder.priority}
                </Badge>
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
                      onClick={() => handleEmailWorkOrder(workOrder)}
                      disabled={!workOrder.contractor?.email || emailingWorkOrders.has(workOrder.id)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {emailingWorkOrders.has(workOrder.id) ? 'Sending...' : 'Email PDF'}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkOrdersList;
