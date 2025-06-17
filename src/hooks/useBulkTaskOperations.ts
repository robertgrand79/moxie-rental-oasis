
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BulkTaskOperation } from '@/hooks/property-management/types';

export const useBulkTaskOperations = () => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = (taskIds: string[]) => {
    setSelectedTaskIds(taskIds);
  };

  const clearSelection = () => {
    setSelectedTaskIds([]);
  };

  const bulkDeleteTasks = async (taskIds: string[]) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('property_tasks')
        .delete()
        .in('id', taskIds);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${taskIds.length} task${taskIds.length > 1 ? 's' : ''} deleted successfully`,
      });

      clearSelection();
      return true;
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tasks',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkUpdateStatus = async (taskIds: string[], status: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('property_tasks')
        .update({ status })
        .in('id', taskIds);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${taskIds.length} task${taskIds.length > 1 ? 's' : ''} updated successfully`,
      });

      clearSelection();
      return true;
    } catch (error) {
      console.error('Error bulk updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkUpdatePriority = async (taskIds: string[], priority: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('property_tasks')
        .update({ priority })
        .in('id', taskIds);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${taskIds.length} task${taskIds.length > 1 ? 's' : ''} priority updated successfully`,
      });

      clearSelection();
      return true;
    } catch (error) {
      console.error('Error bulk updating task priority:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task priority',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkAssignTasks = async (taskIds: string[], userIds: string[]) => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, remove existing assignments for these tasks
      await supabase
        .from('task_assignments')
        .delete()
        .in('task_id', taskIds);

      // Then create new assignments
      const assignments = taskIds.flatMap(taskId =>
        userIds.map(userId => ({
          task_id: taskId,
          user_id: userId,
          assigned_by: user.id
        }))
      );

      const { error } = await supabase
        .from('task_assignments')
        .insert(assignments);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${taskIds.length} task${taskIds.length > 1 ? 's' : ''} assigned successfully`,
      });

      clearSelection();
      return true;
    } catch (error) {
      console.error('Error bulk assigning tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign tasks',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedTaskIds,
    isProcessing,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    bulkDeleteTasks,
    bulkUpdateStatus,
    bulkUpdatePriority,
    bulkAssignTasks,
  };
};
