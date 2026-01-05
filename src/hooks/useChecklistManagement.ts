import { useState, useEffect, useCallback, useMemo } from 'react';
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

export const useChecklistManagement = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [runs, setRuns] = useState<ChecklistRun[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Get organization context for multi-tenant filtering
  const { organization } = useCurrentOrganization();
  const { properties: orgProperties, loading: propertiesLoading } = usePropertyFetch();
  // Memoize property IDs to prevent infinite re-render loops
  const orgPropertyIds = useMemo(() => orgProperties.map(p => p.id), [orgProperties]);

  const fetchTemplates = useCallback(async () => {
    if (!organization?.id) return;
    
    // Fetch templates that are system templates OR belong to this organization
    const { data, error } = await supabase
      .from('maintenance_checklist_templates')
      .select('*')
      .or(`is_system_template.eq.true,organization_id.eq.${organization.id}`)
      .order('type', { ascending: true });

    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }

    // Fetch items for each template
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

    setTemplates(templatesWithItems as ChecklistTemplate[]);
  }, [organization?.id]);

  const fetchRuns = useCallback(async () => {
    if (orgPropertyIds.length === 0) return;
    
    // Filter runs by organization's properties
    const { data, error } = await supabase
      .from('property_checklist_runs')
      .select(`
        *,
        template:maintenance_checklist_templates(*),
        property:properties(id, title)
      `)
      .in('property_id', orgPropertyIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching runs:', error);
      return;
    }

    // Fetch completions for each run
    const runsWithCompletions = await Promise.all(
      (data || []).map(async (run) => {
        const { data: completions } = await supabase
          .from('property_checklist_item_completions')
          .select('*')
          .eq('run_id', run.id);
        return { ...run, completions: completions || [] };
      })
    );

    setRuns(runsWithCompletions as ChecklistRun[]);
  }, [orgPropertyIds]);

  const startChecklist = async (templateId: string, propertyId: string, period: string, dueDate?: string) => {
    const { data: run, error: runError } = await supabase
      .from('property_checklist_runs')
      .insert({
        template_id: templateId,
        property_id: propertyId,
        period,
        due_date: dueDate || null,
        status: 'not_started',
      })
      .select()
      .single();

    if (runError) {
      toast({ title: 'Error', description: 'Failed to start checklist', variant: 'destructive' });
      return null;
    }

    // Get template items and create completion records
    const { data: items } = await supabase
      .from('maintenance_checklist_items')
      .select('id')
      .eq('template_id', templateId);

    if (items && items.length > 0) {
      const completionRecords = items.map((item) => ({
        run_id: run.id,
        item_id: item.id,
        is_completed: false,
        photos: [],
        needs_work: false,
      }));

      await supabase.from('property_checklist_item_completions').insert(completionRecords);
    }

    toast({ title: 'Success', description: 'Checklist started successfully' });
    await fetchRuns();
    return run;
  };

  const toggleItemCompletion = async (completionId: string, isCompleted: boolean, runId: string) => {
    const { error } = await supabase
      .from('property_checklist_item_completions')
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', completionId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
      return;
    }

    // Check if all items are completed and update run status
    const { data: completions } = await supabase
      .from('property_checklist_item_completions')
      .select('is_completed')
      .eq('run_id', runId);

    if (completions) {
      const allCompleted = completions.every((c) => c.is_completed);
      const anyCompleted = completions.some((c) => c.is_completed);

      let newStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      if (allCompleted) {
        newStatus = 'completed';
      } else if (anyCompleted) {
        newStatus = 'in_progress';
      }

      await supabase
        .from('property_checklist_runs')
        .update({
          status: newStatus,
          started_at: anyCompleted ? new Date().toISOString() : null,
          completed_at: allCompleted ? new Date().toISOString() : null,
        })
        .eq('id', runId);
    }

    await fetchRuns();
  };

  const updateItemCompletion = async (
    completionId: string,
    updates: { notes?: string; photos?: string[]; needs_work?: boolean }
  ) => {
    const { error } = await supabase
      .from('property_checklist_item_completions')
      .update(updates)
      .eq('id', completionId);

    if (error) {
      console.error('Error updating completion:', error);
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
      return false;
    }

    await fetchRuns();
    return true;
  };

  const deleteRun = async (runId: string) => {
    const { error } = await supabase
      .from('property_checklist_runs')
      .delete()
      .eq('id', runId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete checklist', variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: 'Checklist deleted' });
    await fetchRuns();
  };

  const createTemplate = async (name: string, type: string, description: string, organizationId?: string | null) => {
    const { data, error } = await supabase
      .from('maintenance_checklist_templates')
      .insert({
        name,
        type,
        description: description || null,
        is_system_template: false,
        organization_id: organizationId || null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      toast({ title: 'Error', description: 'Failed to create checklist template', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Success', description: 'Checklist template created' });
    return data;
  };

  const saveTemplateWithItems = async (
    templateData: { name: string; type: string; description: string; categories: CategoryWithItems[] },
    existingTemplateId?: string
  ) => {
    const user = (await supabase.auth.getUser()).data.user;

    if (existingTemplateId) {
      // Update existing template
      const { error: updateError } = await supabase
        .from('maintenance_checklist_templates')
        .update({
          name: templateData.name,
          type: templateData.type,
          description: templateData.description || null,
        })
        .eq('id', existingTemplateId);

      if (updateError) {
        toast({ title: 'Error', description: 'Failed to update template', variant: 'destructive' });
        return null;
      }

      // Delete existing items
      await supabase
        .from('maintenance_checklist_items')
        .delete()
        .eq('template_id', existingTemplateId);

      // Insert new items
      let displayOrder = 0;
      for (const category of templateData.categories) {
        for (const item of category.items) {
          if (!item.title.trim()) continue;
          await supabase.from('maintenance_checklist_items').insert({
            template_id: existingTemplateId,
            category: category.name,
            title: item.title.trim(),
            description: item.description.trim() || null,
            display_order: displayOrder++,
            is_active: true,
          });
        }
      }

      toast({ title: 'Success', description: 'Template updated successfully' });
      await fetchTemplates();
      return existingTemplateId;
    } else {
      // Create new template
      const { data: newTemplate, error: createError } = await supabase
        .from('maintenance_checklist_templates')
        .insert({
          name: templateData.name,
          type: templateData.type,
          description: templateData.description || null,
          is_system_template: false,
          created_by: user?.id,
          organization_id: organization?.id || null,
        })
        .select()
        .single();

      if (createError || !newTemplate) {
        toast({ title: 'Error', description: 'Failed to create template', variant: 'destructive' });
        return null;
      }

      // Insert items
      let displayOrder = 0;
      for (const category of templateData.categories) {
        for (const item of category.items) {
          if (!item.title.trim()) continue;
          await supabase.from('maintenance_checklist_items').insert({
            template_id: newTemplate.id,
            category: category.name,
            title: item.title.trim(),
            description: item.description.trim() || null,
            display_order: displayOrder++,
            is_active: true,
          });
        }
      }

      toast({ title: 'Success', description: 'Template created successfully' });
      await fetchTemplates();
      return newTemplate.id;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    // Check if there are any runs using this template
    const { data: existingRuns } = await supabase
      .from('property_checklist_runs')
      .select('id')
      .eq('template_id', templateId)
      .limit(1);

    if (existingRuns && existingRuns.length > 0) {
      toast({
        title: 'Cannot Delete',
        description: 'This template has existing checklists. Delete those first.',
        variant: 'destructive',
      });
      return false;
    }

    // Delete items first
    await supabase.from('maintenance_checklist_items').delete().eq('template_id', templateId);

    // Delete template
    const { error } = await supabase
      .from('maintenance_checklist_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Success', description: 'Template deleted' });
    await fetchTemplates();
    return true;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!organization?.id || propertiesLoading) return;
      setLoading(true);
      await Promise.all([fetchTemplates(), fetchRuns()]);
      setLoading(false);
    };
    loadData();
  }, [organization?.id, propertiesLoading, fetchTemplates, fetchRuns]);

  return {
    templates,
    runs,
    loading,
    startChecklist,
    toggleItemCompletion,
    updateItemCompletion,
    deleteRun,
    createTemplate,
    saveTemplateWithItems,
    deleteTemplate,
    refreshData: () => Promise.all([fetchTemplates(), fetchRuns()]),
  };
};
