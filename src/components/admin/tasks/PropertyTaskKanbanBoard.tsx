
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PropertyTask } from '@/hooks/property-management/types';
import { Calendar, MapPin, Trash2, User, Plus, Wrench, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyTaskKanbanBoardProps {
  tasks: PropertyTask[];
  onTaskClick: (task: PropertyTask) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateWorkOrder?: (task: PropertyTask) => void;
  selectedTaskIds: string[];
  onToggleTaskSelection: (taskId: string) => void;
  bulkMode: boolean;
}

const columns = [
  { 
    id: 'pending', 
    title: 'Pending', 
    color: 'border-gray-200 bg-gray-50',
    cardColor: 'border-l-4 border-gray-400',
    badgeColor: 'bg-gray-100 text-gray-700'
  },
  { 
    id: 'in_progress', 
    title: 'In Progress', 
    color: 'border-blue-200 bg-blue-50',
    cardColor: 'border-l-4 border-blue-500',
    badgeColor: 'bg-blue-100 text-blue-700'
  },
  { 
    id: 'completed', 
    title: 'Completed', 
    color: 'border-green-200 bg-green-50',
    cardColor: 'border-l-4 border-green-500',
    badgeColor: 'bg-green-100 text-green-700'
  },
  { 
    id: 'blocked', 
    title: 'Blocked', 
    color: 'border-red-200 bg-red-50',
    cardColor: 'border-l-4 border-red-500',
    badgeColor: 'bg-red-100 text-red-700'
  },
];

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const PropertyTaskKanbanBoard = ({ 
  tasks, 
  onTaskClick, 
  onStatusChange, 
  onDeleteTask,
  onCreateWorkOrder,
  selectedTaskIds,
  onToggleTaskSelection,
  bulkMode
}: PropertyTaskKanbanBoardProps) => {
  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onStatusChange(taskId, status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleCardClick = (task: PropertyTask) => {
    if (bulkMode) {
      onToggleTaskSelection(task.id);
    } else {
      onTaskClick(task);
    }
  };

  const getTaskTypeDisplay = (task: PropertyTask) => {
    if (task.task_type) {
      return {
        name: task.task_type.name,
        color: task.task_type.color,
        icon: task.task_type.icon
      };
    }
    return {
      name: task.type.replace('_', ' '),
      color: '#6B7280',
      icon: 'clipboard'
    };
  };

  const getAssignmentDisplay = (task: PropertyTask) => {
    if (!task.assignments || task.assignments.length === 0) return null;
    
    if (task.assignments.length === 1) {
      const user = task.assignments[0].user;
      return user?.full_name || user?.email || 'Assigned';
    }
    
    return `${task.assignments.length} assignees`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.id);
        
        return (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <Badge variant="outline" className={column.badgeColor}>
                {columnTasks.length}
              </Badge>
            </div>
            
            <div
              className={cn(
                "min-h-[500px] p-4 rounded-lg border-2 border-dashed transition-colors",
                column.color
              )}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragOver={handleDragOver}
            >
              <div className="space-y-3">
                {columnTasks.map((task) => {
                  const taskTypeDisplay = getTaskTypeDisplay(task);
                  const isSelected = selectedTaskIds.includes(task.id);
                  const assignmentText = getAssignmentDisplay(task);
                  
                  return (
                    <Card
                      key={task.id}
                      className={cn(
                        "cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]",
                        column.cardColor,
                        isSelected && "ring-2 ring-blue-500",
                        !bulkMode && "hover:bg-gray-50"
                      )}
                      draggable={!bulkMode}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => handleCardClick(task)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2 flex-1">
                            {bulkMode && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onToggleTaskSelection(task.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <CardTitle className="text-sm flex-1 leading-tight">
                              {task.title}
                            </CardTitle>
                          </div>
                          {!bulkMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task.id);
                              }}
                              className="text-red-600 hover:text-red-800 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-2">
                        {task.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between gap-2">
                          <Badge className={priorityColors[task.priority as keyof typeof priorityColors]} variant="outline">
                            {task.priority}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ backgroundColor: `${taskTypeDisplay.color}20`, borderColor: taskTypeDisplay.color }}
                          >
                            {taskTypeDisplay.name}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-500">
                          {task.property && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{task.property.title}</span>
                            </div>
                          )}
                          {task.project && (
                            <div className="flex items-center gap-1">
                              <Plus className="h-3 w-3" />
                              <span className="truncate">{task.project.title}</span>
                            </div>
                          )}
                          {assignmentText && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span className="truncate">{assignmentText}</span>
                            </div>
                          )}
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.is_recurring && task.recurrence_frequency && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="truncate">
                                Repeats {task.recurrence_frequency}
                                {task.recurrence_interval && task.recurrence_interval > 1 && ` (every ${task.recurrence_interval})`}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {onCreateWorkOrder && !bulkMode && (task.type === 'repair' || task.type === 'maintenance') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateWorkOrder(task);
                            }}
                            className="w-full mt-2"
                          >
                            <Wrench className="h-3 w-3 mr-1" />
                            Create Work Order
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PropertyTaskKanbanBoard;
