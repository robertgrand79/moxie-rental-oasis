
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyTask } from './types';

export const useTaskOperations = (
  setTasks: React.Dispatch<React.SetStateAction<PropertyTask[]>>
) => {
  const { toast } = useToast();

  const createTask = async (taskData: Omit<PropertyTask, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property' | 'project'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('property_tasks')
        .insert([{ ...taskData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        // Fetch related data
        const fetchPromises = [];
        
        if (data.property_id) {
          fetchPromises.push(
            supabase.from('properties').select('*').eq('id', data.property_id).single()
          );
        } else {
          fetchPromises.push(Promise.resolve({ data: null }));
        }
        
        if (data.project_id) {
          fetchPromises.push(
            supabase.from('property_projects').select('*').eq('id', data.project_id).single()
          );
        } else {
          fetchPromises.push(Promise.resolve({ data: null }));
        }
        
        const [propertyResult, projectResult] = await Promise.all(fetchPromises);
        
        const taskWithRelations: PropertyTask = {
          ...data,
          type: data.type as PropertyTask['type'],
          status: data.status as PropertyTask['status'],
          priority: data.priority as PropertyTask['priority'],
          property: propertyResult.data,
          project: projectResult.data
        };
        
        setTasks(prev => [taskWithRelations, ...prev]);
        toast({
          title: 'Success',
          description: 'Task created successfully',
        });
        
        return taskWithRelations;
      }
      
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
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        // Fetch related data
        const fetchPromises = [];
        
        if (data.property_id) {
          fetchPromises.push(
            supabase.from('properties').select('*').eq('id', data.property_id).single()
          );
        } else {
          fetchPromises.push(Promise.resolve({ data: null }));
        }
        
        if (data.project_id) {
          fetchPromises.push(
            supabase.from('property_projects').select('*').eq('id', data.project_id).single()
          );
        } else {
          fetchPromises.push(Promise.resolve({ data: null }));
        }
        
        const [propertyResult, projectResult] = await Promise.all(fetchPromises);
        
        const updatedTask: PropertyTask = {
          ...data,
          type: data.type as PropertyTask['type'],
          status: data.status as PropertyTask['status'],
          priority: data.priority as PropertyTask['priority'],
          property: propertyResult.data,
          project: projectResult.data
        };
        
        setTasks(prev => prev.map(task => 
          task.id === taskId ? updatedTask : task
        ));
        
        return updatedTask;
      }
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
        .from('property_tasks')
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

  return {
    createTask,
    updateTask,
    deleteTask,
  };
};
