
import React, { useState, useMemo } from 'react';
import { PropertyTask } from '@/hooks/property-management/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface TaskCalendarViewProps {
  tasks: PropertyTask[];
  onTaskClick: (task: PropertyTask) => void;
  onCreateTask: () => void;
}

const TaskCalendarView = ({
  tasks,
  onTaskClick,
  onCreateTask,
}: TaskCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [showDayTasks, setShowDayTasks] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (propertyFilter === 'all') return true;
      return task.property_id === propertyFilter;
    });
  }, [tasks, propertyFilter]);

  const getTasksForDate = (date: Date) => {
    return filteredTasks.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (task: PropertyTask) => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== 'completed';
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(viewDate),
    end: endOfMonth(viewDate)
  });

  const properties = Array.from(new Set(tasks.map(task => task.property).filter(Boolean)));

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property?.id} value={property?.id || ''}>
                  {property?.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(new Date())}
          >
            Today
          </Button>
          <Button onClick={onCreateTask} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {format(viewDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={viewDate}
                onMonthChange={setViewDate}
                className="w-full"
                components={{
                  Day: ({ date, ...props }) => {
                    const dayTasks = getTasksForDate(date);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    
                    return (
                      <div className="relative p-2 w-full h-full min-h-[60px]">
                        <button
                          {...props}
                          className={`w-full h-full flex flex-col items-start justify-start p-1 rounded-md hover:bg-gray-100 ${
                            isSelected ? 'bg-blue-50 border-2 border-blue-300' : ''
                          }`}
                          onClick={() => {
                            setSelectedDate(date);
                            if (dayTasks.length > 0) {
                              setShowDayTasks(true);
                            }
                          }}
                        >
                          <span className="text-sm font-medium mb-1">
                            {format(date, 'd')}
                          </span>
                          <div className="flex flex-wrap gap-1 w-full">
                            {dayTasks.slice(0, 3).map((task, index) => (
                              <div
                                key={task.id}
                                className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} ${
                                  isOverdue(task) ? 'ring-2 ring-red-300' : ''
                                }`}
                                title={task.title}
                              />
                            ))}
                            {dayTasks.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{dayTasks.length - 3}
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Tasks */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        isOverdue(task) ? 'border-red-200 bg-red-50' : ''
                      }`}
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="space-y-2">
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="flex flex-wrap gap-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(task.priority)} text-white`}
                          >
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {task.property && (
                          <div className="text-xs text-gray-600">
                            {task.property.title}
                          </div>
                        )}
                        {isOverdue(task) && (
                          <div className="text-xs text-red-600 font-medium">
                            Overdue
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No tasks scheduled</p>
                  {selectedDate && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={onCreateTask}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Day Tasks Modal */}
      <Dialog open={showDayTasks} onOpenChange={setShowDayTasks}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Tasks for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedDateTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  isOverdue(task) ? 'border-red-200 bg-red-50' : ''
                }`}
                onClick={() => {
                  onTaskClick(task);
                  setShowDayTasks(false);
                }}
              >
                <div className="space-y-2">
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-gray-600">{task.description}</div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(task.priority)} text-white`}
                    >
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {task.property && (
                    <div className="text-sm text-gray-600">
                      Property: {task.property.title}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">Priority:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-300"></div>
              <span>Overdue</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCalendarView;
