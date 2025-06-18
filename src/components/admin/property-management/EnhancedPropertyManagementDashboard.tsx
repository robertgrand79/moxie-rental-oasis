
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import { useWorkOrderManagement } from '@/hooks/useWorkOrderManagement';
import { useBulkTaskOperations } from '@/hooks/useBulkTaskOperations';
import { useCustomTaskTypes } from '@/hooks/useCustomTaskTypes';
import { useTaskManagementState } from '@/hooks/useTaskManagementState';
import { useTaskManagementHandlers } from '@/hooks/useTaskManagementHandlers';
import { useTaskStats } from '@/components/admin/tasks/TaskManagementStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Calendar, 
  CheckSquare, 
  AlertTriangle, 
  Home,
  ClipboardList,
  Wrench,
  Settings,
  Building2,
  Kanban,
  Table as TableIcon
} from 'lucide-react';
import LoadingState from '@/components/ui/loading-state';
import TaskManagementActions from '../tasks/TaskManagementActions';
import TaskManagementViews from '../tasks/TaskManagementViews';
import TaskManagementModals from '../tasks/TaskManagementModals';
import BulkTaskActions from '../tasks/BulkTaskActions';
import GoogleCalendarIntegration from '../tasks/GoogleCalendarIntegration';

const EnhancedPropertyManagementDashboard = () => {
  const {
    properties,
    projects,
    tasks,
    loading,
    createProject,
    createTask,
    updateTask,
    deleteTask,
    generateTurnoverTasks,
    refreshData,
  } = usePropertyManagement();

  const { contractors, createWorkOrder } = useWorkOrderManagement();
  const { taskTypes } = useCustomTaskTypes();
  
  const {
    selectedTaskIds,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
  } = useBulkTaskOperations();

  const {
    view,
    setView,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isProjectModalOpen,
    setIsProjectModalOpen,
    isWorkOrderModalOpen,
    setIsWorkOrderModalOpen,
    isTaskTypeModalOpen,
    setIsTaskTypeModalOpen,
    editingTask,
    setEditingTask,
    selectedTaskForWorkOrder,
    setSelectedTaskForWorkOrder,
    bulkMode,
    setBulkMode,
  } = useTaskManagementState();

  const {
    handleTaskClick,
    handleCreateWorkOrder,
    handleStatusChange,
    handleCreateTask,
    handleCreateProject,
    handleCreateWorkOrderFromTask,
    handleDeleteTask,
    handleToggleBulkMode,
    handleSelectAllTasks,
  } = useTaskManagementHandlers({
    bulkMode,
    editingTask,
    selectedTaskForWorkOrder,
    setEditingTask,
    setIsTaskModalOpen,
    setSelectedTaskForWorkOrder,
    setIsWorkOrderModalOpen,
    setBulkMode,
    updateTask,
    createTask,
    createProject,
    createWorkOrder,
    deleteTask,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
  });

  const { totalTasks, completedTasks, pendingTasks, overdueTasks } = useTaskStats(tasks);

  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('tasks');

  // Handle tab query parameter for redirects from old task management
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['tasks', 'projects', 'properties', 'calendar', 'workorders', 'integrations'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const filteredTasks = selectedProperty === 'all' 
    ? tasks 
    : tasks.filter(task => task.property_id === selectedProperty);

  const filteredProjects = selectedProperty === 'all' 
    ? projects 
    : projects.filter(project => project.property_id === selectedProperty);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
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

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600">Comprehensive property operations, tasks, and project management</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      {overdueTasks > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Overdue Tasks ({overdueTasks})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.filter(task => 
                task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
              ).slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <span className="font-medium">{task.title}</span>
                    {task.property && (
                      <span className="text-sm text-gray-600 ml-2">
                        - {task.property.title}
                      </span>
                    )}
                  </div>
                  <Badge className={getPriorityBadgeColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
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
            onToggleBulkMode={handleToggleBulkMode}
            onSelectAllTasks={() => handleSelectAllTasks(filteredTasks)}
            onOpenTaskTypeModal={() => setIsTaskTypeModalOpen(true)}
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
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeleteTask}
            onCreateWorkOrder={handleCreateWorkOrder}
            onToggleTaskSelection={toggleTaskSelection}
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
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            onDeleteTask={handleDeleteTask}
            onCreateWorkOrder={handleCreateWorkOrder}
            onToggleTaskSelection={toggleTaskSelection}
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

      <TaskManagementModals
        isTaskModalOpen={isTaskModalOpen}
        isProjectModalOpen={isProjectModalOpen}
        isWorkOrderModalOpen={isWorkOrderModalOpen}
        editingTask={editingTask}
        selectedTaskForWorkOrder={selectedTaskForWorkOrder}
        properties={properties}
        projects={projects}
        taskTypes={taskTypes}
        contractors={contractors}
        onCloseTaskModal={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onCloseProjectModal={() => setIsProjectModalOpen(false)}
        onCloseWorkOrderModal={() => {
          setIsWorkOrderModalOpen(false);
          setSelectedTaskForWorkOrder(null);
        }}
        onCreateTask={handleCreateTask}
        onCreateProject={handleCreateProject}
        onCreateWorkOrder={handleCreateWorkOrderFromTask}
      />
    </div>
  );
};

export default EnhancedPropertyManagementDashboard;
