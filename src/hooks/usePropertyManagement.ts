
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
      const { data, error } = await supabase
        .from('property_projects')
        .select(`
          *,
          property:properties(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
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
      const { data, error } = await supabase
        .from('property_tasks')
        .select(`
          *,
          property:properties(*),
          project:property_projects(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
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
        .from('property_projects')
        .insert([{ ...projectData, created_by: user.id }])
        .select(`
          *,
          property:properties(*)
        `)
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
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
        .from('property_tasks')
        .insert([{ ...taskData, created_by: user.id }])
        .select(`
          *,
          property:properties(*),
          project:property_projects(*)
        `)
        .single();

      if (error) throw error;
      
      setTasks(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      
      return data;
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
        .from('property_tasks')
        .update(updates)
        .eq('id', taskId)
        .select(`
          *,
          property:properties(*),
          project:property_projects(*)
        `)
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? data : task
      ));
      
      return data;
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
        .from('property_tasks')
        .insert(tasksToCreate)
        .select(`
          *,
          property:properties(*),
          project:property_projects(*)
        `);

      if (error) throw error;
      
      setTasks(prev => [...(data || []), ...prev]);
      toast({
        title: 'Success',
        description: `Generated ${turnoverTasks.length} turnover tasks`,
      });
      
      return data;
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
    generateTurnoverTasks,
    refreshData: () => Promise.all([fetchProperties(), fetchProjects(), fetchTasks()]),
  };
};
