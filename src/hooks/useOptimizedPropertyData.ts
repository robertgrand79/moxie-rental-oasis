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
    const startTime = Date.now();
    console.log('🏠 useOptimizedPropertyData - Fetching properties...');
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('title')
        .limit(50); // Limit for performance

      if (error) {
        console.error('❌ useOptimizedPropertyData - Properties fetch error:', error);
        throw error;
      }
      
      const endTime = Date.now();
      console.log(`✅ useOptimizedPropertyData - Properties fetched: ${data?.length || 0} in ${endTime - startTime}ms`);
      setProperties(data || []);
      return data || [];
    } catch (error) {
      console.error('❌ useOptimizedPropertyData - Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const fetchProjectsWithJoins = async () => {
    const startTime = Date.now();
    console.log('📂 useOptimizedPropertyData - Fetching projects...');
    try {
      const { data, error } = await supabase
        .from('property_projects')
        .select(`
          *,
          property:properties(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limit for performance

      if (error) {
        console.error('❌ useOptimizedPropertyData - Projects fetch error:', error);
        throw error;
      }
      
      const endTime = Date.now();
      console.log(`✅ useOptimizedPropertyData - Projects fetched: ${data?.length || 0} in ${endTime - startTime}ms`);
      
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
      return projectsWithProperties;
    } catch (error) {
      console.error('❌ useOptimizedPropertyData - Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const fetchTasksWithJoins = async () => {
    const startTime = Date.now();
    console.log('📝 useOptimizedPropertyData - Fetching tasks...');
    try {
      const { data, error } = await supabase
        .from('property_tasks')
        .select(`
          *,
          property:properties(*),
          project:property_projects(*)
        `)
        .order('created_at', { ascending: false })
        .limit(200); // Limit for performance

      if (error) {
        console.error('❌ useOptimizedPropertyData - Tasks fetch error:', error);
        throw error;
      }
      
      const endTime = Date.now();
      console.log(`✅ useOptimizedPropertyData - Tasks fetched: ${data?.length || 0} in ${endTime - startTime}ms`);
      
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
        recurrence_frequency: task.recurrence_frequency as PropertyTask['recurrence_frequency'],
        recurrence_interval: task.recurrence_interval,
        recurrence_end_date: task.recurrence_end_date,
        task_type_id: task.task_type_id,
        checklist_items: task.checklist_items,
        photos: task.photos,
        notes: task.notes,
        created_by: task.created_by,
        created_at: task.created_at,
        updated_at: task.updated_at,
        property: task.property,
        project: task.project ? {
          id: task.project.id,
          property_id: task.project.property_id,
          title: task.project.title,
          description: task.project.description,
          type: task.project.type as PropertyProject['type'],
          status: task.project.status as PropertyProject['status'],
          priority: task.project.priority as PropertyProject['priority'],
          start_date: task.project.start_date,
          target_completion_date: task.project.target_completion_date,
          actual_completion_date: task.project.actual_completion_date,
          budget: task.project.budget,
          actual_cost: task.project.actual_cost,
          created_by: task.project.created_by,
          created_at: task.project.created_at,
          updated_at: task.project.updated_at,
        } : undefined
      }));
      
      setTasks(tasksWithRelations);
      return tasksWithRelations;
    } catch (error) {
      console.error('❌ useOptimizedPropertyData - Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const loadData = async () => {
    const startTime = Date.now();
    console.log('🚀 useOptimizedPropertyData - Starting data load...');
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetchProperties(),
        fetchProjectsWithJoins(),
        fetchTasksWithJoins()
      ]);
      
      // Check if any promises were rejected
      const rejectedResults = results.filter(result => result.status === 'rejected');
      if (rejectedResults.length > 0) {
        console.error('❌ useOptimizedPropertyData - Some data fetches failed:', rejectedResults);
        rejectedResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`❌ useOptimizedPropertyData - Failed fetch ${index}:`, result.reason);
          }
        });
        // Don't throw here - we want to show partial data if possible
      }
      
      const endTime = Date.now();
      console.log(`✅ useOptimizedPropertyData - Data load completed in ${endTime - startTime}ms`);
    } catch (error) {
      console.error('❌ useOptimizedPropertyData - Critical error during data load:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    console.log('🔄 useOptimizedPropertyData - Refreshing data...');
    try {
      const results = await Promise.allSettled([
        fetchProperties(),
        fetchProjectsWithJoins(),
        fetchTasksWithJoins()
      ]);
      
      const rejectedResults = results.filter(result => result.status === 'rejected');
      if (rejectedResults.length > 0) {
        console.error('❌ useOptimizedPropertyData - Some refresh fetches failed:', rejectedResults);
      }
      
      console.log('✅ useOptimizedPropertyData - Data refresh completed');
    } catch (error) {
      console.error('❌ useOptimizedPropertyData - Error refreshing data:', error);
    }
  };

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
