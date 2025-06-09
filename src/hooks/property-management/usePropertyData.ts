
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';
import { PropertyProject, PropertyTask } from './types';

export const usePropertyData = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<PropertyProject[]>([]);
  const [tasks, setTasks] = useState<PropertyTask[]>([]);
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Get unique property IDs
        const propertyIds = Array.from(new Set(
          data.map(project => project.property_id).filter(id => id)
        ));
        
        let propertiesMap = new Map<string, any>();
        
        if (propertyIds.length > 0) {
          const { data: propertiesData } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);

          if (propertiesData) {
            propertiesMap = new Map(
              propertiesData.map(property => [property.id, property])
            );
          }
        }
        
        const projectsWithProperties: PropertyProject[] = data.map(project => ({
          ...project,
          type: project.type as PropertyProject['type'],
          status: project.status as PropertyProject['status'],
          priority: project.priority as PropertyProject['priority'],
          property: project.property_id ? propertiesMap.get(project.property_id) : undefined
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
      const { data, error } = await supabase
        .from('property_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Get unique IDs
        const propertyIds = Array.from(new Set(
          data.map(task => task.property_id).filter(id => id)
        ));
        const projectIds = Array.from(new Set(
          data.map(task => task.project_id).filter(id => id)
        ));
        
        // Fetch related data
        const fetchPromises = [];
        
        if (propertyIds.length > 0) {
          fetchPromises.push(
            supabase.from('properties').select('*').in('id', propertyIds)
          );
        } else {
          fetchPromises.push(Promise.resolve({ data: [] }));
        }
        
        if (projectIds.length > 0) {
          fetchPromises.push(
            supabase.from('property_projects').select('*').in('id', projectIds)
          );
        } else {
          fetchPromises.push(Promise.resolve({ data: [] }));
        }

        const [propertiesResult, projectsResult] = await Promise.all(fetchPromises);

        const propertiesMap = new Map<string, any>(
          (propertiesResult.data || []).map(property => [property.id, property])
        );
        const projectsMap = new Map<string, any>(
          (projectsResult.data || []).map(project => [project.id, project])
        );
        
        const tasksWithRelations: PropertyTask[] = data.map(task => ({
          ...task,
          type: task.type as PropertyTask['type'],
          status: task.status as PropertyTask['status'],
          priority: task.priority as PropertyTask['priority'],
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

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchProperties(), fetchProjects(), fetchTasks()]);
    setLoading(false);
  };

  const refreshData = () => Promise.all([fetchProperties(), fetchProjects(), fetchTasks()]);

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
