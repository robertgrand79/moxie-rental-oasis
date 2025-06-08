
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { Calendar, DollarSign, MapPin, Trash2, User, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkOrdersListProps {
  workOrders: WorkOrder[];
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  onStatusChange: (workOrderId: string, status: string) => void;
  onDeleteWorkOrder: (workOrderId: string) => void;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  acknowledged: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  invoiced: 'bg-indigo-100 text-indigo-700',
  paid: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const WorkOrdersList = ({
  workOrders,
  onWorkOrderClick,
  onStatusChange,
  onDeleteWorkOrder,
}: WorkOrdersListProps) => {
  if (workOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
          <p className="text-gray-500 text-center">
            Create your first work order to get started with property maintenance management.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {workOrders.map((workOrder) => (
        <Card key={workOrder.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 
                    className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                    onClick={() => onWorkOrderClick(workOrder)}
                  >
                    {workOrder.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {workOrder.work_order_number}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">{workOrder.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {workOrder.contractor && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{workOrder.contractor.name}</span>
                    </div>
                  )}
                  {workOrder.property && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{workOrder.property.title}</span>
                    </div>
                  )}
                  {workOrder.estimated_cost && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${workOrder.estimated_cost}</span>
                    </div>
                  )}
                  {workOrder.estimated_completion_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(workOrder.estimated_completion_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={priorityColors[workOrder.priority as keyof typeof priorityColors]}>
                  {workOrder.priority}
                </Badge>
                <Select
                  value={workOrder.status}
                  onValueChange={(status) => onStatusChange(workOrder.id, status)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue>
                      <Badge className={statusColors[workOrder.status as keyof typeof statusColors]}>
                        {workOrder.status.replace('_', ' ')}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="invoiced">Invoiced</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteWorkOrder(workOrder.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default WorkOrdersList;
