
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyTask } from './types';

export const useTaskOperations = (
  setTasks: React.Dispatch<React.SetStateAction<PropertyTask[]>>
) => {
  const { toast } = useToast();

  const createTask = async (taskData: Omit<PropertyTask, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property' | 'project' | 'task_type' | 'assignments'>): Promise<PropertyTask> => {
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

        if (data.task_type_id) {
          fetchPromises.push(
            supabase.from('custom_task_types').select('*').eq('id', data.task_type_id).single()
          );
        } else {
          fetchPromises.push(Promise.resolve({ data: null }));
        }

        // Fetch task assignments with proper join to profiles table
        fetchPromises.push(
          supabase
            .from('task_assignments')
            .select(`
              id,
              task_id,
              user_id,
              assigned_at,
              assigned_by,
              user:profiles!user_id(id, email, full_name)
            `)
            .eq('task_id', data.id)
        );
        
        const [propertyResult, projectResult, taskTypeResult, assignmentsResult] = await Promise.all(fetchPromises);
        
        const taskWithRelations: PropertyTask = {
          id: data.id,
          property_id: data.property_id,
          project_id: data.project_id,
          title: data.title,
          description: data.description,
          type: data.type as PropertyTask['type'],
          status: data.status as PropertyTask['status'],
          priority: data.priority as PropertyTask['priority'],
          assigned_to: data.assigned_to,
          due_date: data.due_date,
          estimated_hours: data.estimated_hours,
          actual_hours: data.actual_hours,
          is_recurring: data.is_recurring,
          recurrence_pattern: data.recurrence_pattern,
          recurrence_frequency: data.recurrence_frequency as PropertyTask['recurrence_frequency'],
          recurrence_interval: data.recurrence_interval,
          recurrence_end_date: data.recurrence_end_date,
          task_type_id: data.task_type_id,
          checklist_items: data.checklist_items,
          photos: data.photos,
          notes: data.notes,
          created_by: data.created_by,
          created_at: data.created_at,
          updated_at: data.updated_at,
          property: propertyResult.data,
          project: projectResult.data,
          task_type: taskTypeResult.data,
          assignments: assignmentsResult.data ? assignmentsResult.data.map(assignment => ({
            id: assignment.id,
            task_id: assignment.task_id,
            user_id: assignment.user_id,
            assigned_at: assignment.assigned_at,
            assigned_by: assignment.assigned_by,
            user: assignment.user
          })) : []
        };
        
        setTasks(prev => [taskWithRelations, ...prev]);
        toast({
          title: 'Success',
          description: 'Task created successfully',
        });
        
        return taskWithRelations;
      }
      
      throw new Error('No data returned from task creation');
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

  const updateTask = async (taskId: string, updates: Partial<PropertyTask>): Promise<PropertyTask> => {
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

        if (data.task_type_id) {
          fetchPromises.push(
            supabase.from('custom_task_types').select('*').eq('id', data.task_type_id).single()
          );
        } else {
          fetchPromises.push(Promise.resolve({ data: null }));
        }

        // Fetch task assignments with proper join to profiles table
        fetchPromises.push(
          supabase
            .from('task_assignments')
            .select(`
              id,
              task_id,
              user_id,
              assigned_at,
              assigned_by,
              user:profiles!user_id(id, email, full_name)
            `)
            .eq('task_id', data.id)
        );
        
        const [propertyResult, projectResult, taskTypeResult, assignmentsResult] = await Promise.all(fetchPromises);
        
        const updatedTask: PropertyTask = {
          id: data.id,
          property_id: data.property_id,
          project_id: data.project_id,
          title: data.title,
          description: data.description,
          type: data.type as PropertyTask['type'],
          status: data.status as PropertyTask['status'],
          priority: data.priority as PropertyTask['priority'],
          assigned_to: data.assigned_to,
          due_date: data.due_date,
          estimated_hours: data.estimated_hours,
          actual_hours: data.actual_hours,
          is_recurring: data.is_recurring,
          recurrence_pattern: data.recurrence_pattern,
          recurrence_frequency: data.recurrence_frequency as PropertyTask['recurrence_frequency'],
          recurrence_interval: data.recurrence_interval,
          recurrence_end_date: data.recurrence_end_date,
          task_type_id: data.task_type_id,
          checklist_items: data.checklist_items,
          photos: data.photos,
          notes: data.notes,
          created_by: data.created_by,
          created_at: data.created_at,
          updated_at: data.updated_at,
          property: propertyResult.data,
          project: projectResult.data,
          task_type: taskTypeResult.data,
          assignments: assignmentsResult.data ? assignmentsResult.data.map(assignment => ({
            id: assignment.id,
            task_id: assignment.task_id,
            user_id: assignment.user_id,
            assigned_at: assignment.assigned_at,
            assigned_by: assignment.assigned_by,
            user: assignment.user
          })) : []
        };
        
        setTasks(prev => prev.map(task => 
          task.id === taskId ? updatedTask : task
        ));
        
        return updatedTask;
      }
      
      throw new Error('No data returned from task update');
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

  const assignUsersToTask = async (taskId: string, userIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, remove existing assignments
      await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId);

      // Then create new assignments
      if (userIds.length > 0) {
        const assignments = userIds.map(userId => ({
          task_id: taskId,
          user_id: userId,
          assigned_by: user.id
        }));

        const { error } = await supabase
          .from('task_assignments')
          .insert(assignments);

        if (error) throw error;
      }

      // Refresh the task to get updated assignments
      const { data: taskData, error: taskError } = await supabase
        .from('property_tasks')
        .select(`
          *,
          property:properties(*),
          project:property_projects(*),
          task_type:custom_task_types(*),
          assignments:task_assignments(
            id,
            task_id,
            user_id,
            assigned_at,
            assigned_by,
            user:profiles!user_id(id, email, full_name)
          )
        `)
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      if (taskData) {
        // Transform the data to match PropertyTask type with proper type casting
        const transformedTask: PropertyTask = {
          id: taskData.id,
          property_id: taskData.property_id,
          project_id: taskData.project_id,
          title: taskData.title,
          description: taskData.description,
          type: taskData.type as PropertyTask['type'],
          status: taskData.status as PropertyTask['status'],
          priority: taskData.priority as PropertyTask['priority'],
          assigned_to: taskData.assigned_to,
          due_date: taskData.due_date,
          estimated_hours: taskData.estimated_hours,
          actual_hours: taskData.actual_hours,
          is_recurring: taskData.is_recurring,
          recurrence_pattern: taskData.recurrence_pattern,
          recurrence_frequency: taskData.recurrence_frequency as PropertyTask['recurrence_frequency'],
          recurrence_interval: taskData.recurrence_interval,
          recurrence_end_date: taskData.recurrence_end_date,
          task_type_id: taskData.task_type_id,
          checklist_items: taskData.checklist_items,
          photos: taskData.photos,
          notes: taskData.notes,
          created_by: taskData.created_by,
          created_at: taskData.created_at,
          updated_at: taskData.updated_at,
          property: taskData.property,
          project: taskData.project,
          task_type: taskData.task_type,
          assignments: taskData.assignments ? taskData.assignments.map(assignment => ({
            id: assignment.id,
            task_id: assignment.task_id,
            user_id: assignment.user_id,
            assigned_at: assignment.assigned_at,
            assigned_by: assignment.assigned_by,
            user: assignment.user
          })) : []
        };

        setTasks(prev => prev.map(task => 
          task.id === taskId ? transformedTask : task
        ));
      }

      toast({
        title: 'Success',
        description: 'Task assignments updated successfully',
      });
    } catch (error) {
      console.error('Error updating task assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task assignments',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    assignUsersToTask,
  };
};
