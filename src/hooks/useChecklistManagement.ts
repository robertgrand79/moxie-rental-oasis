
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'fall' | 'spring' | 'custom';
  description: string | null;
  is_system_template: boolean;
  organization_id: string | null;
  created_at: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  template_id: string;
  category: string;
  title: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export interface ChecklistRun {
  id: string;
  template_id: string;
  property_id: string;
  period: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  template?: ChecklistTemplate;
  property?: { id: string; title: string };
  completions?: ItemCompletion[];
}

export interface ItemCompletion {
  id: string;
  run_id: string;
  item_id: string;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  work_order_id: string | null;
  photos?: string[];
  needs_work?: boolean;
}

interface CategoryWithItems {
  name: string;
  items: { title: string; description: string }[];
}

export const checklistKeys = {
  templates: (orgId: string) => ['checklist-templates', orgId] as const,
  runs: (orgId: string) => ['checklist-runs', orgId] as const,
};

const fetchTemplatesFn = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('maintenance_checklist_templates')
    .select('*')
    .or(`is_system_template.eq.true,organization_id.eq.${organizationId}`)
    .order('type', { ascending: true });

  if (error) throw error;

  const templatesWithItems = await Promise.all(
    (data || []).map(async (template) => {
      const { data: items } = await supabase
        .from('maintenance_checklist_items')
        .select('*')
        .eq('template_id', template.id)
        .order('display_order', { ascending: true });
      return { ...template, items: items || [] };
    })
  );

  return templatesWithItems as ChecklistTemplate[];
};

const fetchRunsFn = async (propertyIds: string[]) => {
  if (propertyIds.length === 0) return [];

  const { data, error } = await supabase
    .from('property_checklist_runs')
    .select(`
      *,
      template:maintenance_checklist_templates(*),
      property:properties(id, title)
    `)
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const runsWithCompletions = await Promise.all(
    (data || []).map(async (run) => {
      const { data: completions } = await supabase
        .from('property_checklist_item_completions')
        .select('*')
        .eq('run_id', run.id);
      return { ...run, completions: completions || [] };
    })
  );

  return runsWithCompletions as ChecklistRun[];
};

export const useChecklistManagement = () => {
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();
  const { properties: orgProperties, loading: propertiesLoading } = usePropertyFetch();
  const queryClient = useQueryClient();
  const orgId = organization?.id || '';
  const orgPropertyIds = useMemo(() => orgProperties.map(p => p.id), [orgProperties]);

  const templatesQuery = useQuery({
    queryKey: checklistKeys.templates(orgId),
    queryFn: () => fetchTemplatesFn(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const runsQuery = useQuery({
    queryKey: checklistKeys.runs(orgId),
    queryFn: () => fetchRunsFn(orgPropertyIds),
    enabled: !!orgId && !propertiesLoading && orgPropertyIds.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const invalidateRuns = () => queryClient.invalidateQueries({ queryKey: checklistKeys.runs(orgId) });
  const invalidateTemplates = () => queryClient.invalidateQueries({ queryKey: checklistKeys.templates(orgId) });

  const startChecklistMutation = useMutation({
    mutationFn: async ({ templateId, propertyId, period, dueDate }: { templateId: string; propertyId: string; period: string; dueDate?: string }) => {
      const { data: run, error: runError } = await supabase
        .from('property_checklist_runs')
        .insert({ template_id: templateId, property_id: propertyId, period, due_date: dueDate || null, status: 'not_started' })
        .select()
        .single();

      if (runError) throw runError;

      const { data: items } = await supabase
        .from('maintenance_checklist_items')
        .select('id')
        .eq('template_id', templateId);

      if (items && items.length > 0) {
        const completionRecords = items.map((item) => ({
          run_id: run.id, item_id: item.id, is_completed: false, photos: [], needs_work: false,
        }));
        await supabase.from('property_checklist_item_completions').insert(completionRecords);
      }

      return run;
    },
    onSuccess: () => {
      invalidateRuns();
      toast({ title: 'Success', description: 'Checklist started successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to start checklist', variant: 'destructive' });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ completionId, isCompleted, runId }: { completionId: string; isCompleted: boolean; runId: string }) => {
      const { error } = await supabase
        .from('property_checklist_item_completions')
        .update({ is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
        .eq('id', completionId);

      if (error) throw error;

      const { data: completions } = await supabase
        .from('property_checklist_item_completions')
        .select('is_completed')
        .eq('run_id', runId);

      if (completions) {
        const allCompleted = completions.every((c) => c.is_completed);
        const anyCompleted = completions.some((c) => c.is_completed);
        let newStatus: string = 'not_started';
        if (allCompleted) newStatus = 'completed';
        else if (anyCompleted) newStatus = 'in_progress';

        await supabase
          .from('property_checklist_runs')
          .update({
            status: newStatus,
            started_at: anyCompleted ? new Date().toISOString() : null,
            completed_at: allCompleted ? new Date().toISOString() : null,
          })
          .eq('id', runId);
      }
    },
    onSuccess: () => invalidateRuns(),
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
    },
  });

  const updateCompletionMutation = useMutation({
    mutationFn: async ({ completionId, updates }: { completionId: string; updates: { notes?: string; photos?: string[]; needs_work?: boolean } }) => {
      const { error } = await supabase
        .from('property_checklist_item_completions')
        .update(updates)
        .eq('id', completionId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => invalidateRuns(),
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
    },
  });

  const deleteRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase
        .from('property_checklist_runs')
        .delete()
        .eq('id', runId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRuns();
      toast({ title: 'Success', description: 'Checklist deleted' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete checklist', variant: 'destructive' });
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async ({ templateData, existingTemplateId }: { templateData: { name: string; type: string; description: string; categories: CategoryWithItems[] }; existingTemplateId?: string }) => {
      const user = (await supabase.auth.getUser()).data.user;

      if (existingTemplateId) {
        const { error: updateError } = await supabase
          .from('maintenance_checklist_templates')
          .update({ name: templateData.name, type: templateData.type, description: templateData.description || null })
          .eq('id', existingTemplateId);

        if (updateError) throw updateError;

        await supabase.from('maintenance_checklist_items').delete().eq('template_id', existingTemplateId);

        let displayOrder = 0;
        for (const category of templateData.categories) {
          for (const item of category.items) {
            if (!item.title.trim()) continue;
            await supabase.from('maintenance_checklist_items').insert({
              template_id: existingTemplateId, category: category.name,
              title: item.title.trim(), description: item.description.trim() || null,
              display_order: displayOrder++, is_active: true,
            });
          }
        }
        return existingTemplateId;
      } else {
        const { data: newTemplate, error: createError } = await supabase
          .from('maintenance_checklist_templates')
          .insert({
            name: templateData.name, type: templateData.type,
            description: templateData.description || null,
            is_system_template: false, created_by: user?.id,
            organization_id: orgId || null,
          })
          .select()
          .single();

        if (createError || !newTemplate) throw createError || new Error('Failed to create template');

        let displayOrder = 0;
        for (const category of templateData.categories) {
          for (const item of category.items) {
            if (!item.title.trim()) continue;
            await supabase.from('maintenance_checklist_items').insert({
              template_id: newTemplate.id, category: category.name,
              title: item.title.trim(), description: item.description.trim() || null,
              display_order: displayOrder++, is_active: true,
            });
          }
        }
        return newTemplate.id;
      }
    },
    onSuccess: (_, variables) => {
      invalidateTemplates();
      toast({ title: 'Success', description: variables.existingTemplateId ? 'Template updated successfully' : 'Template created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save template', variant: 'destructive' });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { data: existingRuns } = await supabase
        .from('property_checklist_runs')
        .select('id')
        .eq('template_id', templateId)
        .limit(1);

      if (existingRuns && existingRuns.length > 0) {
        throw new Error('TEMPLATE_HAS_RUNS');
      }

      await supabase.from('maintenance_checklist_items').delete().eq('template_id', templateId);

      const { error } = await supabase
        .from('maintenance_checklist_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateTemplates();
      toast({ title: 'Success', description: 'Template deleted' });
    },
    onError: (error: Error) => {
      if (error.message === 'TEMPLATE_HAS_RUNS') {
        toast({ title: 'Cannot Delete', description: 'This template has existing checklists. Delete those first.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
      }
    },
  });

  // Backward-compatible API
  const startChecklist = (templateId: string, propertyId: string, period: string, dueDate?: string) =>
    startChecklistMutation.mutateAsync({ templateId, propertyId, period, dueDate });

  const toggleItemCompletion = (completionId: string, isCompleted: boolean, runId: string) =>
    toggleItemMutation.mutateAsync({ completionId, isCompleted, runId });

  const updateItemCompletion = async (completionId: string, updates: { notes?: string; photos?: string[]; needs_work?: boolean }) => {
    try {
      await updateCompletionMutation.mutateAsync({ completionId, updates });
      return true;
    } catch {
      return false;
    }
  };

  const deleteRun = (runId: string) => deleteRunMutation.mutateAsync(runId);

  const createTemplate = async (name: string, type: string, description: string, organizationId?: string | null) => {
    const { data, error } = await supabase
      .from('maintenance_checklist_templates')
      .insert({
        name, type, description: description || null,
        is_system_template: false, organization_id: organizationId || null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create checklist template', variant: 'destructive' });
      return null;
    }
    invalidateTemplates();
    toast({ title: 'Success', description: 'Checklist template created' });
    return data;
  };

  const saveTemplateWithItems = (
    templateData: { name: string; type: string; description: string; categories: CategoryWithItems[] },
    existingTemplateId?: string
  ) => saveTemplateMutation.mutateAsync({ templateData, existingTemplateId });

  const deleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplateMutation.mutateAsync(templateId);
      return true;
    } catch {
      return false;
    }
  };

  return {
    templates: templatesQuery.data || [],
    runs: runsQuery.data || [],
    loading: templatesQuery.isLoading || runsQuery.isLoading,
    error: templatesQuery.error || runsQuery.error,
    startChecklist,
    toggleItemCompletion,
    updateItemCompletion,
    deleteRun,
    createTemplate,
    saveTemplateWithItems,
    deleteTemplate,
    refreshData: () => { invalidateTemplates(); invalidateRuns(); },
  };
};
