
import React, { useState, useMemo } from 'react';
import { PropertyTask } from '@/hooks/property-management/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface TaskTableViewProps {
  tasks: PropertyTask[];
  selectedTaskIds: string[];
  bulkMode: boolean;
  onTaskClick: (task: PropertyTask) => void;
  onToggleTaskSelection: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateWorkOrder: (task: PropertyTask) => void;
}

type SortField = 'title' | 'due_date' | 'priority' | 'status' | 'property';
type SortDirection = 'asc' | 'desc';

const TaskTableView = ({
  tasks,
  selectedTaskIds,
  bulkMode,
  onTaskClick,
  onToggleTaskSelection,
  onStatusChange,
  onDeleteTask,
  onCreateWorkOrder,
}: TaskTableViewProps) => {
  const [sortField, setSortField] = useState<SortField>('due_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && tasks.find(t => t.due_date === dueDate)?.status !== 'completed';
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.property?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date) : new Date('9999-12-31');
          bValue = b.due_date ? new Date(b.due_date) : new Date('9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'property':
          aValue = a.property?.title || '';
          bValue = b.property?.title || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortField, sortDirection]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {bulkMode && (
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
              )}
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('title')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Task
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('property')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Property
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('priority')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Priority
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('status')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('due_date')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Due Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTasks.map((task) => (
              <TableRow
                key={task.id}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedTaskIds.includes(task.id) ? 'bg-blue-50' : ''
                } ${task.status === 'completed' ? 'opacity-75' : ''}`}
                onClick={() => !bulkMode && onTaskClick(task)}
              >
                {bulkMode && (
                  <TableCell>
                    <Checkbox
                      checked={selectedTaskIds.includes(task.id)}
                      onCheckedChange={() => onToggleTaskSelection(task.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-600 truncate max-w-xs">
                        {task.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {task.property && (
                    <Badge variant="outline">{task.property.title}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{task.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityBadgeColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.due_date && (
                    <div className={isOverdue(task.due_date) ? 'text-red-600 font-medium' : ''}>
                      {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onTaskClick(task)}>
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCreateWorkOrder(task)}>
                        Create Work Order
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteTask(task.id)}
                        className="text-red-600"
                      >
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredAndSortedTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTableView;
