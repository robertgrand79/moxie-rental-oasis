
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';
import { PropertyProject, PropertyTask } from './property-management/types';

export const useOptimizedPropertyData = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [tasks, setTasks] = useState<PropertyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, bedrooms, bathrooms, max_guests, created_at')
        .order('title')
        .limit(50); // Limit for performance

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

  const fetchProjectsWithJoins = async () => {
    try {
      const { data, error } = await supabase
        .from('property_projects')
        .select(`
          *,
          property:properties(id, title, location)
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limit for performance

      if (error) throw error;
      
      const projectsWithProperties: PropertyProject[] = (data || []).map(project => ({
        id: project.id,
        property_id: project.property_id,
        title: project.title,
        description: project.description,
        type: project.type as PropertyProject['type'],
        status: project.status as PropertyProject['status'],
        priority: project.priority as PropertyProject['priority'],
        start_date: project.start_date,
        target_completion_date: project.target_completion_date,
        actual_completion_date: project.actual_completion_date,
        budget: project.budget,
        actual_cost: project.actual_cost,
        created_by: project.created_by,
        created_at: project.created_at,
        updated_at: project.updated_at,
        property: project.property
      }));
      
      setProjects(projectsWithProperties);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
    }
  };

  const fetchTasksWithJoins = async () => {
    try {
      const { data, error } = await supabase
        .from('property_tasks')
        .select(`
          *,
          property:properties(id, title, location),
          project:property_projects(id, title)
        `)
        .order('created_at', { ascending: false })
        .limit(200); // Limit for performance

      if (error) throw error;
      
      const tasksWithRelations: PropertyTask[] = (data || []).map(task => ({
        id: task.id,
        property_id: task.property_id,
        project_id: task.project_id,
        title: task.title,
        description: task.description,
        type: task.type as PropertyTask['type'],
        status: task.status as PropertyTask['status'],
        priority: task.priority as PropertyTask['priority'],
        assigned_to: task.assigned_to,
        due_date: task.due_date,
        estimated_hours: task.estimated_hours,
        actual_hours: task.actual_hours,
        is_recurring: task.is_recurring,
        recurrence_pattern: task.recurrence_pattern,
        checklist_items: task.checklist_items,
        photos: task.photos,
        notes: task.notes,
        created_by: task.created_by,
        created_at: task.created_at,
        updated_at: task.updated_at,
        property: task.property,
        project: task.project
      }));
      
      setTasks(tasksWithRelations);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchProperties(), fetchProjectsWithJoins(), fetchTasksWithJoins()]);
    setLoading(false);
  };

  const refreshData = () => Promise.all([fetchProperties(), fetchProjectsWithJoins(), fetchTasksWithJoins()]);

  return {
    properties,
    projects,
    tasks,
    loading,
    setProperties,
    setProjects,
    setTasks,
    loadData,
    refreshData,
  };
};
