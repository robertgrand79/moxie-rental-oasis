
import React, { useState } from 'react';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
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
  Users,
  Wrench,
  ClipboardList
} from 'lucide-react';
import LoadingState from '@/components/ui/loading-state';

const PropertyManagementDashboard = () => {
  const {
    properties,
    projects,
    tasks,
    loading,
    generateTurnoverTasks,
  } = usePropertyManagement();

  const [selectedProperty, setSelectedProperty] = useState<string>('all');

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

  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  );

  const upcomingTasks = tasks.filter(task => 
    task.due_date && 
    new Date(task.due_date) >= new Date() && 
    new Date(task.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    task.status !== 'completed'
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600">Manage properties, projects, and maintenance tasks</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
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
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueTasks.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Overdue Tasks ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTasks.slice(0, 3).map((task) => (
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
              {overdueTasks.length > 3 && (
                <p className="text-sm text-gray-600">
                  ... and {overdueTasks.length - 3} more overdue tasks
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tasks</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          
          <div className="grid gap-4">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No tasks found</p>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {task.property && (
                            <Badge variant="outline">{task.property.title}</Badge>
                          )}
                          {task.due_date && (
                            <Badge variant="outline">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityBadgeColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusBadgeColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Projects</h3>
            <Button>
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
                        size="sm"
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

        <TabsContent value="schedule" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Maintenance Schedule</h3>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Calendar view coming soon...</p>
              <p className="text-sm text-gray-400 mt-2">
                Will show scheduled maintenance, inspections, and recurring tasks
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyManagementDashboard;
