
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Calendar, 
  Wrench,
  Kanban,
  Table as TableIcon
} from 'lucide-react';
import { Property } from '@/types/property';
import { PropertyProject, PropertyTask, CustomTaskType } from '@/hooks/property-management/types';
import TaskManagementActions from '../tasks/TaskManagementActions';
import TaskManagementViews from '../tasks/TaskManagementViews';
import BulkTaskActions from '../tasks/BulkTaskActions';
import GoogleCalendarIntegration from '../tasks/GoogleCalendarIntegration';

interface PropertyManagementTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  view: 'kanban' | 'table' | 'calendar';
  setView: (view: 'kanban' | 'table' | 'calendar') => void;
  filteredTasks: PropertyTask[];
  filteredProjects: PropertyProject[];
  properties: Property[];
  tasks: PropertyTask[];
  selectedTaskIds: string[];
  bulkMode: boolean;
  contractors: any[];
  setEditingTask: (task: PropertyTask | null) => void;
  setIsTaskModalOpen: (open: boolean) => void;
  setIsProjectModalOpen: (open: boolean) => void;
  setIsWorkOrderModalOpen: (open: boolean) => void;
  generateTurnoverTasks: (propertyId: string, date: string) => void;
  onToggleBulkMode: () => void;
  onSelectAllTasks: (tasks: PropertyTask[]) => void;
  onTaskClick: (task: PropertyTask) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateWorkOrder: (task: PropertyTask) => void;
  onToggleTaskSelection: (taskId: string) => void;
  clearSelection: () => void;
  refreshData: () => void;
  getStatusBadgeColor: (status: string) => string;
  getPriorityBadgeColor: (priority: string) => string;
}

const PropertyManagementTabs = ({
  activeTab,
  setActiveTab,
  view,
  setView,
  filteredTasks,
  filteredProjects,
  properties,
  tasks,
  selectedTaskIds,
  bulkMode,
  contractors,
  setEditingTask,
  setIsTaskModalOpen,
  setIsProjectModalOpen,
  setIsWorkOrderModalOpen,
  generateTurnoverTasks,
  onToggleBulkMode,
  onSelectAllTasks,
  onTaskClick,
  onStatusChange,
  onDeleteTask,
  onCreateWorkOrder,
  onToggleTaskSelection,
  clearSelection,
  refreshData,
  getStatusBadgeColor,
  getPriorityBadgeColor,
}: PropertyManagementTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="properties">Properties</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="workorders">Work Orders</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>

      <TabsContent value="tasks" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Task Management</h3>
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('kanban')}
              >
                <Kanban className="h-4 w-4 mr-1" />
                Kanban
              </Button>
              <Button
                variant={view === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('table')}
              >
                <TableIcon className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button
                variant={view === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('calendar')}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </Button>
            </div>
          </div>
          <Button onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        <TaskManagementActions
          bulkMode={bulkMode}
          onToggleBulkMode={onToggleBulkMode}
          onSelectAllTasks={() => onSelectAllTasks(filteredTasks)}
          onOpenTaskTypeModal={() => {}}
          tasksCount={filteredTasks.length}
        />

        {bulkMode && (
          <BulkTaskActions
            selectedCount={selectedTaskIds.length}
            onClearSelection={clearSelection}
            onRefresh={refreshData}
          />
        )}

        <TaskManagementViews
          view={view}
          tasks={filteredTasks}
          selectedTaskIds={selectedTaskIds}
          bulkMode={bulkMode}
          onTaskClick={onTaskClick}
          onStatusChange={onStatusChange}
          onDeleteTask={onDeleteTask}
          onCreateWorkOrder={onCreateWorkOrder}
          onToggleTaskSelection={onToggleTaskSelection}
        />
      </TabsContent>

      <TabsContent value="projects" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Projects</h3>
          <Button onClick={() => setIsProjectModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
        
        <div className="grid gap-4">
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No projects found</p>
              </CardContent>
            </Card>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{project.title}</h4>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {project.property && (
                          <Badge variant="outline">{project.property.title}</Badge>
                        )}
                        <Badge variant="outline">{project.type}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityBadgeColor(project.priority)}>
                        {project.priority}
                      </Badge>
                      <Badge className={getStatusBadgeColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="properties" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Properties</h3>
        </div>
        
        <div className="grid gap-4">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{property.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{property.location}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>Max {property.max_guests} guests</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      onClick={() => generateTurnoverTasks(property.id, new Date().toISOString().split('T')[0])}
                    >
                      Generate Turnover Tasks
                    </Button>
                    <div className="text-sm text-gray-500">
                      Active Tasks: {tasks.filter(t => t.property_id === property.id && t.status !== 'completed').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="calendar" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Calendar & Schedule</h3>
        </div>
        
        <TaskManagementViews
          view="calendar"
          tasks={filteredTasks}
          selectedTaskIds={selectedTaskIds}
          bulkMode={false}
          onTaskClick={onTaskClick}
          onStatusChange={onStatusChange}
          onDeleteTask={onDeleteTask}
          onCreateWorkOrder={onCreateWorkOrder}
          onToggleTaskSelection={onToggleTaskSelection}
        />
      </TabsContent>

      <TabsContent value="workorders" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Work Orders</h3>
          <Button onClick={() => setIsWorkOrderModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Work Order
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Work order management integrated with tasks</p>
            <p className="text-sm text-gray-400 mt-2">
              Create work orders directly from tasks or manage contractor workflows
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="integrations" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Integrations</h3>
        </div>
        
        <GoogleCalendarIntegration />
      </TabsContent>
    </Tabs>
  );
};

export default PropertyManagementTabs;
