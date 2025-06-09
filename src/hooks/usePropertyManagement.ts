
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';

export interface PropertyProject {
  id: string;
  property_id: string;
  title: string;
  description?: string;
  type: 'maintenance' | 'turnover' | 'inspection' | 'repair' | 'improvement';
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  budget?: number;
  actual_cost?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface PropertyTask {
  id: string;
  property_id?: string;
  project_id?: string;
  title: string;
  description?: string;
  type: 'cleaning' | 'maintenance' | 'inspection' | 'repair' | 'supply_order' | 'guest_service' | 'admin';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  is_recurring: boolean;
  recurrence_pattern?: string;
  checklist_items?: string[];
  photos?: string[];
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  project?: PropertyProject;
}

export interface MaintenanceSchedule {
  id: string;
  property_id: string;
  task_type: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
  next_due_date: string;
  last_completed?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [tasks, setTasks] = useState<PropertyTask[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('title');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties',
        variant: 'destructive',
      });
    }
  };

  const fetchProjects = async () => {
    try {
      // Direct query without joins until types are updated
      const { data, error } = await supabase
        .from('property_projects' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch related properties separately
      if (data && data.length > 0) {
        const propertyIds = [...new Set(data.map((p: any) => p.property_id))];
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);

        const propertiesMap = new Map(propertiesData?.map(p => [p.id, p]) || []);
        
        const projectsWithProperties = data.map((project: any) => ({
          ...project,
          property: propertiesMap.get(project.property_id)
        }));
        
        setProjects(projectsWithProperties);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
    }
  };

  const fetchTasks = async () => {
    try {
      // Direct query without joins until types are updated
      const { data, error } = await supabase
        .from('property_tasks' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch related data separately
      if (data && data.length > 0) {
        const propertyIds = [...new Set(data.map((t: any) => t.property_id).filter(Boolean))];
        const projectIds = [...new Set(data.map((t: any) => t.project_id).filter(Boolean))];
        
        const [propertiesData, projectsData] = await Promise.all([
          propertyIds.length > 0 ? supabase.from('properties').select('*').in('id', propertyIds) : { data: [] },
          projectIds.length > 0 ? supabase.from('property_projects' as any).select('*').in('id', projectIds) : { data: [] }
        ]);

        const propertiesMap = new Map(propertiesData.data?.map(p => [p.id, p]) || []);
        const projectsMap = new Map(projectsData.data?.map(p => [p.id, p]) || []);
        
        const tasksWithRelations = data.map((task: any) => ({
          ...task,
          property: task.property_id ? propertiesMap.get(task.property_id) : undefined,
          project: task.project_id ? projectsMap.get(task.project_id) : undefined
        }));
        
        setTasks(tasksWithRelations);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',
      });
    }
  };

  const createProject = async (projectData: Omit<PropertyProject, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('property_projects' as any)
        .insert([{ ...projectData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      // Fetch the property for the created project
      if (data.property_id) {
        const { data: property } = await supabase
          .from('properties')
          .select('*')
          .eq('id', data.property_id)
          .single();
        
        const projectWithProperty = { ...data, property };
        setProjects(prev => [projectWithProperty, ...prev]);
        
        toast({
          title: 'Success',
          description: 'Project created successfully',
        });
        
        return projectWithProperty;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createTask = async (taskData: Omit<PropertyTask, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property' | 'project'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('property_tasks' as any)
        .insert([{ ...taskData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      // Fetch related data
      const [propertyData, projectData] = await Promise.all([
        data.property_id ? supabase.from('properties').select('*').eq('id', data.property_id).single() : { data: null },
        data.project_id ? supabase.from('property_projects' as any).select('*').eq('id', data.project_id).single() : { data: null }
      ]);
      
      const taskWithRelations = {
        ...data,
        property: propertyData.data,
        project: projectData.data
      };
      
      setTasks(prev => [taskWithRelations, ...prev]);
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      
      return taskWithRelations;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<PropertyTask>) => {
    try {
      const { data, error } = await supabase
        .from('property_tasks' as any)
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      
      // Fetch related data
      const [propertyData, projectData] = await Promise.all([
        data.property_id ? supabase.from('properties').select('*').eq('id', data.property_id).single() : { data: null },
        data.project_id ? supabase.from('property_projects' as any).select('*').eq('id', data.project_id).single() : { data: null }
      ]);
      
      const updatedTask = {
        ...data,
        property: propertyData.data,
        project: projectData.data
      };
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('property_tasks' as any)
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const generateTurnoverTasks = async (propertyId: string, checkoutDate: string) => {
    const turnoverTasks = [
      {
        title: 'Deep Clean - Bathrooms',
        description: 'Clean and sanitize all bathrooms, replace towels and toiletries',
        type: 'cleaning' as const,
        priority: 'high' as const,
        estimated_hours: 1.5,
      },
      {
        title: 'Deep Clean - Kitchen',
        description: 'Clean appliances, sanitize surfaces, restock supplies',
        type: 'cleaning' as const,
        priority: 'high' as const,
        estimated_hours: 2,
      },
      {
        title: 'Linen Change',
        description: 'Replace all bed linens and check bed condition',
        type: 'cleaning' as const,
        priority: 'high' as const,
        estimated_hours: 0.5,
      },
      {
        title: 'Property Inspection',
        description: 'Check for damages, missing items, and maintenance needs',
        type: 'inspection' as const,
        priority: 'medium' as const,
        estimated_hours: 0.5,
      },
      {
        title: 'Amenity Restock',
        description: 'Restock coffee, toiletries, and welcome amenities',
        type: 'supply_order' as const,
        priority: 'medium' as const,
        estimated_hours: 0.25,
      },
    ];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const tasksToCreate = turnoverTasks.map(task => ({
        ...task,
        property_id: propertyId,
        status: 'pending' as const,
        due_date: checkoutDate,
        is_recurring: false,
        created_by: user.id,
      }));

      const { data, error } = await supabase
        .from('property_tasks' as any)
        .insert(tasksToCreate)
        .select();

      if (error) throw error;
      
      // Fetch property data for the new tasks
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      const tasksWithProperty = (data || []).map((task: any) => ({
        ...task,
        property
      }));
      
      setTasks(prev => [...tasksWithProperty, ...prev]);
      toast({
        title: 'Success',
        description: `Generated ${turnoverTasks.length} turnover tasks`,
      });
      
      return tasksWithProperty;
    } catch (error) {
      console.error('Error generating turnover tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate turnover tasks',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProperties(), fetchProjects(), fetchTasks()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    properties,
    projects,
    tasks,
    schedules,
    loading,
    createProject,
    createTask,
    updateTask,
    deleteTask,
    generateTurnoverTasks,
    refreshData: () => Promise.all([fetchProperties(), fetchProjects(), fetchTasks()]),
  };
};
