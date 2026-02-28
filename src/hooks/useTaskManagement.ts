
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  end_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id?: string;
  property_id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface TaskComment {
  id: string;
  task_id: string;
  comment: string;
  created_by: string;
  created_at: string;
}

const TASK_SELECT = `*, project:projects(*)`;

export const taskKeys = {
  projects: () => ['task-projects'] as const,
  tasks: () => ['tasks'] as const,
};

export const useTaskManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: taskKeys.projects(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Project[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const tasksQuery = useQuery({
    queryKey: taskKeys.tasks(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(TASK_SELECT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Task[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...projectData, created_by: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.projects() });
      toast({ title: 'Success', description: 'Project created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'project'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, created_by: user.id }])
        .select(TASK_SELECT)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.tasks() });
      toast({ title: 'Success', description: 'Task created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select(TASK_SELECT)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.tasks() });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.tasks() });
      toast({ title: 'Success', description: 'Task deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete task', variant: 'destructive' });
    },
  });

  // Backward-compatible API
  const createProject = (data: any) => createProjectMutation.mutateAsync(data);
  const createTask = (data: any) => createTaskMutation.mutateAsync(data);
  const updateTask = (taskId: string, updates: Partial<Task>) => updateTaskMutation.mutateAsync({ taskId, updates });
  const deleteTask = (taskId: string) => deleteTaskMutation.mutateAsync(taskId);

  return {
    projects: projectsQuery.data || [],
    tasks: tasksQuery.data || [],
    loading: projectsQuery.isLoading || tasksQuery.isLoading,
    error: projectsQuery.error || tasksQuery.error,
    createProject,
    createTask,
    updateTask,
    deleteTask,
    refreshData: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.projects() });
      queryClient.invalidateQueries({ queryKey: taskKeys.tasks() });
    },
  };
};
