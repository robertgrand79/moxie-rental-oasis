import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

export const useChecklistManagement = () => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [runs, setRuns] = useState<ChecklistRun[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('maintenance_checklist_templates')
      .select('*')
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
  };

  const fetchRuns = async () => {
    const { data, error } = await supabase
      .from('property_checklist_runs')
      .select(`
        *,
        template:maintenance_checklist_templates(*),
        property:properties(id, title)
      `)
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
  };

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTemplates(), fetchRuns()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return {
    templates,
    runs,
    loading,
    startChecklist,
    toggleItemCompletion,
    deleteRun,
    refreshData: () => Promise.all([fetchTemplates(), fetchRuns()]),
  };
};
