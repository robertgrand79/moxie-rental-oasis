
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CustomTaskType } from '@/hooks/property-management/types';

export const useCustomTaskTypes = () => {
  const [taskTypes, setTaskTypes] = useState<CustomTaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTaskTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_task_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTaskTypes(data || []);
    } catch (error) {
      console.error('Error fetching task types:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch task types',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTaskType = async (taskTypeData: Omit<CustomTaskType, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('custom_task_types')
        .insert([{ ...taskTypeData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setTaskTypes(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: 'Success',
        description: 'Task type created successfully',
      });
      
      return data;
    } catch (error) {
      console.error('Error creating task type:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task type',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTaskType = async (id: string, updates: Partial<CustomTaskType>) => {
    try {
      const { data, error } = await supabase
        .from('custom_task_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTaskTypes(prev => prev.map(type => 
        type.id === id ? data : type
      ).sort((a, b) => a.name.localeCompare(b.name)));
      
      toast({
        title: 'Success',
        description: 'Task type updated successfully',
      });
      
      return data;
    } catch (error) {
      console.error('Error updating task type:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task type',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteTaskType = async (id: string) => {
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('custom_task_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setTaskTypes(prev => prev.filter(type => type.id !== id));
      toast({
        title: 'Success',
        description: 'Task type deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting task type:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task type',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTaskTypes();
  }, []);

  return {
    taskTypes,
    loading,
    createTaskType,
    updateTaskType,
    deleteTaskType,
    refreshTaskTypes: fetchTaskTypes,
  };
};
