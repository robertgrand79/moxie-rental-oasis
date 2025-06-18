
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useWorkOrderRelationships = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createProjectFromWorkOrder = async (workOrderId: string, projectData: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('property_projects')
        .insert([{
          ...projectData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // Update work order to link to project
      const { error: linkError } = await supabase
        .from('work_orders')
        .update({ project_id: project.id })
        .eq('id', workOrderId);

      if (linkError) throw linkError;

      toast({
        title: 'Success',
        description: 'Project created and linked to work order',
      });

      return project;
    } catch (error) {
      console.error('Error creating project from work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project from work order',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTaskFromWorkOrder = async (workOrderId: string, taskData: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the task
      const { data: task, error: taskError } = await supabase
        .from('property_tasks')
        .insert([{
          ...taskData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      toast({
        title: 'Success',
        description: 'Follow-up task created successfully',
      });

      return task;
    } catch (error) {
      console.error('Error creating task from work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create follow-up task',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const linkWorkOrderToProject = async (workOrderId: string, projectId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ project_id: projectId })
        .eq('id', workOrderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Work order linked to project successfully',
      });
    } catch (error) {
      console.error('Error linking work order to project:', error);
      toast({
        title: 'Error',
        description: 'Failed to link work order to project',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createProjectFromWorkOrder,
    createTaskFromWorkOrder,
    linkWorkOrderToProject,
  };
};
