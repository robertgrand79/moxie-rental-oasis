import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string | null;
  trigger_event: 'user_registration' | 'organization_created' | 'support_ticket' | 'manual';
  title_template: string;
  description_template: string | null;
  priority: 'low' | 'normal' | 'high';
  due_days: number | null;
  assign_to_role: string | null;
  assign_to_user_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  assigned_user?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  trigger_event: TaskTemplate['trigger_event'];
  title_template: string;
  description_template?: string;
  priority?: 'low' | 'normal' | 'high';
  due_days?: number;
  assign_to_role?: string | null;
  assign_to_user_id?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateTemplateInput {
  id: string;
  name?: string;
  description?: string;
  trigger_event?: TaskTemplate['trigger_event'];
  title_template?: string;
  description_template?: string;
  priority?: 'low' | 'normal' | 'high';
  due_days?: number | null;
  assign_to_role?: string | null;
  assign_to_user_id?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export const TRIGGER_EVENTS = [
  { value: 'user_registration', label: 'User Registration', description: 'When a new user creates an account' },
  { value: 'organization_created', label: 'Organization Created', description: 'When a new organization is set up' },
  { value: 'support_ticket', label: 'Support Ticket', description: 'When a support ticket is created' },
  { value: 'manual', label: 'Manual', description: 'For tasks created manually from templates' },
] as const;

export const TEMPLATE_VARIABLES = {
  user_registration: ['{{user_name}}', '{{user_email}}', '{{date}}'],
  organization_created: ['{{org_name}}', '{{date}}'],
  support_ticket: ['{{ticket_number}}', '{{user_name}}', '{{date}}'],
  manual: ['{{date}}'],
};

export const usePlatformTaskTemplates = (options?: { triggerEvent?: string; includeInactive?: boolean }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['platform-task-templates', options?.triggerEvent, options?.includeInactive],
    queryFn: async () => {
      try {
        let query = supabase
          .from('platform_task_templates')
          .select(`
            *,
            profiles:assign_to_user_id (
              full_name,
              email
            )
          `)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (options?.triggerEvent) {
          query = query.eq('trigger_event', options.triggerEvent);
        }

        if (!options?.includeInactive) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;
        if (error) {
          console.warn('Task templates query error:', error.message);
          return [];
        }
        return (data || []).map((template: any) => ({
          ...template,
          assigned_user: template.profiles || null,
        })) as TaskTemplate[];
      } catch (err) {
        console.warn('Task templates error:', err);
        return [];
      }
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const { data, error } = await supabase
        .from('platform_task_templates')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TaskTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-task-templates'] });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async (input: UpdateTemplateInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('platform_task_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TaskTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-task-templates'] });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('platform_task_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-task-templates'] });
    },
  });

  const toggleTemplate = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('platform_task_templates')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TaskTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-task-templates'] });
    },
  });

  // Group templates by trigger event
  const templatesByTrigger = templates.reduce((acc, template) => {
    if (!acc[template.trigger_event]) {
      acc[template.trigger_event] = [];
    }
    acc[template.trigger_event].push(template);
    return acc;
  }, {} as Record<string, TaskTemplate[]>);

  return {
    templates,
    templatesByTrigger,
    isLoading,
    error,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    toggleTemplate: toggleTemplate.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
};
