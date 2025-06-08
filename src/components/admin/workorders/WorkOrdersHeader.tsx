
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkOrdersHeaderProps {
  totalWorkOrders: number;
  pendingWorkOrders: number;
  onCreateWorkOrder: () => void;
  onCreateContractor: () => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
}

const WorkOrdersHeader = ({
  totalWorkOrders,
  pendingWorkOrders,
  onCreateWorkOrder,
  onCreateContractor,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
}: WorkOrdersHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600">Manage property repairs and maintenance requests</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onCreateContractor} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            New Contractor
          </Button>
          <Button onClick={onCreateWorkOrder}>
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total Work Orders:</span>
            <Badge variant="outline">{totalWorkOrders}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Pending:</span>
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              {pendingWorkOrders}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="invoiced">Invoiced</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default WorkOrdersHeader;
