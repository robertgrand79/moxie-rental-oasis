
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Calendar, MapPin, User, Wrench } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PropertyTask } from '@/hooks/usePropertyManagement';

interface PropertyTaskKanbanBoardProps {
  tasks: PropertyTask[];
  onTaskClick: (task: PropertyTask) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateWorkOrder: (task: PropertyTask) => void;
}

const PropertyTaskKanbanBoard = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onDeleteTask,
  onCreateWorkOrder,
}: PropertyTaskKanbanBoardProps) => {
  const columns = [
    { id: 'pending', title: 'Pending', color: 'bg-yellow-100 border-yellow-200' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100 border-blue-200' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100 border-green-200' },
    { id: 'blocked', title: 'Blocked', color: 'bg-red-100 border-red-200' },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cleaning': return '🧹';
      case 'maintenance': return '🔧';
      case 'inspection': return '🔍';
      case 'repair': return '⚡';
      case 'supply_order': return '📦';
      case 'guest_service': return '🏨';
      default: return '📋';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <div key={column.id} className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${column.color}`}>
            <h3 className="font-semibold text-gray-900 flex items-center justify-between">
              {column.title}
              <Badge variant="secondary" className="ml-2">
                {getTasksByStatus(column.id).length}
              </Badge>
            </h3>
          </div>
          
          <div className="space-y-3 min-h-[400px]">
            {getTasksByStatus(column.id).map((task) => (
              <Card 
                key={task.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onTaskClick(task)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(task.type)}</span>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {task.title}
                        </CardTitle>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}>
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onCreateWorkOrder(task);
                        }}>
                          <Wrench className="h-4 w-4 mr-2" />
                          Create Work Order
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="text-red-600"
                        >
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.type}
                      </Badge>
                    </div>
                    
                    {task.property && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{task.property.title}</span>
                      </div>
                    )}
                    
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {task.estimated_hours && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>Est: {task.estimated_hours}h</span>
                      </div>
                    )}

                    {task.assigned_to && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>Assigned</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex gap-1">
                    {columns
                      .filter(col => col.id !== task.status)
                      .slice(0, 2)
                      .map((col) => (
                        <Button
                          key={col.id}
                          variant="outline"
                          size="sm"
                          className="text-xs flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(task.id, col.id);
                          }}
                        >
                          Move to {col.title}
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyTaskKanbanBoard;
