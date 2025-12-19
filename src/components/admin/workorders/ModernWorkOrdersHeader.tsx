
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  Table,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';
import { format } from 'date-fns';

interface ModernWorkOrdersHeaderProps {
  totalWorkOrders: number;
  pendingWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;
  onCreateWorkOrder: () => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onRefresh: () => void;
  workOrders: WorkOrder[];
}

const ModernWorkOrdersHeader = ({
  totalWorkOrders,
  pendingWorkOrders,
  inProgressWorkOrders,
  completedWorkOrders,
  onCreateWorkOrder,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  workOrders,
}: ModernWorkOrdersHeaderProps) => {

  const handleExportCSV = () => {
    if (workOrders.length === 0) return;

    const headers = [
      'Work Order #',
      'Title',
      'Status',
      'Priority',
      'Property',
      'Contractor',
      'Created Date',
      'Due Date',
      'Completed Date',
      'Estimated Cost',
      'Actual Cost',
      'Description'
    ];

    const rows = workOrders.map(wo => [
      wo.work_order_number || '',
      wo.title || '',
      wo.status || '',
      wo.priority || '',
      wo.property?.title || '',
      wo.contractor?.name || '',
      wo.created_at ? format(new Date(wo.created_at), 'yyyy-MM-dd') : '',
      wo.estimated_completion_date ? format(new Date(wo.estimated_completion_date), 'yyyy-MM-dd') : '',
      wo.completed_at ? format(new Date(wo.completed_at), 'yyyy-MM-dd') : '',
      wo.estimated_cost?.toString() || '',
      wo.actual_cost?.toString() || '',
      (wo.description || '').replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `work-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Work Orders</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{totalWorkOrders}</span> Total
            <span className="text-border">•</span>
            <span className="text-amber-600 font-medium">{pendingWorkOrders}</span> Pending
            <span className="text-border">•</span>
            <span className="text-blue-600 font-medium">{inProgressWorkOrders}</span> In Progress
            <span className="text-border">•</span>
            <span className="text-emerald-600 font-medium">{completedWorkOrders}</span> Completed
          </div>
        </div>
        <Button onClick={onCreateWorkOrder} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Filters */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Status" />
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
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-7 w-7 p-0"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="h-7 w-7 p-0"
            >
              <Table className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 w-8 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={handleExportCSV} className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModernWorkOrdersHeader;
