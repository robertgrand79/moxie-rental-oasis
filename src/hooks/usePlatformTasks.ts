import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PlatformTask {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'normal' | 'high';
  due_date: string | null;
  assigned_to: string | null;
  created_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'normal' | 'high';
  due_date?: string;
  assigned_to?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'normal' | 'high';
  due_date?: string | null;
  assigned_to?: string | null;
}

export const usePlatformTasks = (options?: { status?: string; limit?: number }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const limit = options?.limit || 50;

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['platform-tasks', options?.status, limit],
    queryFn: async () => {
      try {
        let query = supabase
          .from('platform_tasks')
          .select('*')
          .order('priority', { ascending: false })
          .order('due_date', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(limit);

        if (options?.status) {
          query = query.eq('status', options.status);
        }

        const { data, error } = await query;
        if (error) {
          console.warn('Platform tasks query error:', error.message);
          return [];
        }
        return data as PlatformTask[];
      } catch (err) {
        console.warn('Platform tasks error:', err);
        return [];
      }
    },
  });

  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data, error } = await supabase
        .from('platform_tasks')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PlatformTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tasks'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const { id, ...updates } = input;
      
      // Set completed_at when status changes to done
      const updatePayload: Record<string, any> = { ...updates };
      if (updates.status === 'done') {
        updatePayload.completed_at = new Date().toISOString();
      } else if (updates.status) {
        updatePayload.completed_at = null;
      }

      const { data, error } = await supabase
        .from('platform_tasks')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PlatformTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('platform_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tasks'] });
    },
  });

  return {
    tasks,
    pendingTasks,
    todoCount,
    inProgressCount,
    isLoading,
    error,
    createTask: createTask.mutate,
    updateTask: updateTask.mutate,
    deleteTask: deleteTask.mutate,
    isCreating: createTask.isPending,
    isUpdating: updateTask.isPending,
  };
};
