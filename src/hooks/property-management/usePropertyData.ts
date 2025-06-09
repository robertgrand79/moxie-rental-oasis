
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
        .from('property_projects' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const propertyIds = [...new Set(data.map((p: any) => p.property_id).filter(Boolean))];
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);

        const propertiesMap = new Map(propertiesData?.map((p: any) => [p.id, p]) || []);
        
        const projectsWithProperties = data.map((project: any) => ({
          ...project,
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
        .from('property_tasks' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const propertyIds = [...new Set(data.map((t: any) => t.property_id).filter(Boolean))];
        const projectIds = [...new Set(data.map((t: any) => t.project_id).filter(Boolean))];
        
        const [propertiesData, projectsData] = await Promise.all([
          propertyIds.length > 0 ? supabase.from('properties').select('*').in('id', propertyIds) : { data: [] },
          projectIds.length > 0 ? supabase.from('property_projects' as any).select('*').in('id', projectIds) : { data: [] }
        ]);

        const propertiesMap = new Map(propertiesData.data?.map((p: any) => [p.id, p]) || []);
        const projectsMap = new Map(projectsData.data?.map((p: any) => [p.id, p]) || []);
        
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
