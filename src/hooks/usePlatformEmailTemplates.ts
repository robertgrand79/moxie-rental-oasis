import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PlatformEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  category: string;
  variables: string[];
  is_active: boolean;
  usage_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  category?: string;
  variables?: string[];
}

export interface UpdateTemplateInput {
  name?: string;
  subject?: string;
  body_html?: string;
  body_text?: string;
  category?: string;
  variables?: string[];
  is_active?: boolean;
}

export const usePlatformEmailTemplates = (category?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch templates
  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ['platform-email-templates', category],
    queryFn: async () => {
      let query = supabase
        .from('platform_email_templates')
        .select('*')
        .order('name', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PlatformEmailTemplate[];
    },
  });

  // Get active templates only
  const activeTemplates = templates.filter(t => t.is_active);

  // Create template
  const createTemplate = useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const { data, error } = await supabase
        .from('platform_email_templates')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-email-templates'] });
      toast.success('Template created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  // Update template
  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...input }: UpdateTemplateInput & { id: string }) => {
      const { data, error } = await supabase
        .from('platform_email_templates')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-email-templates'] });
      toast.success('Template updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  // Delete template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_email_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-email-templates'] });
      toast.success('Template deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  // Duplicate template
  const duplicateTemplate = useMutation({
    mutationFn: async (id: string) => {
      const template = templates.find(t => t.id === id);
      if (!template) throw new Error('Template not found');

      const { data, error } = await supabase
        .from('platform_email_templates')
        .insert({
          name: `${template.name} (Copy)`,
          subject: template.subject,
          body_html: template.body_html,
          body_text: template.body_text,
          category: template.category,
          variables: template.variables,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-email-templates'] });
      toast.success('Template duplicated');
    },
  });

  // Process template with variables
  const processTemplate = (template: PlatformEmailTemplate, variables: Record<string, string>) => {
    let subject = template.subject;
    let bodyHtml = template.body_html;
    let bodyText = template.body_text || '';

    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(pattern, value);
      bodyHtml = bodyHtml.replace(pattern, value);
      bodyText = bodyText.replace(pattern, value);
    }

    return { subject, bodyHtml, bodyText };
  };

  return {
    templates,
    activeTemplates,
    isLoading,
    refetch,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    processTemplate,
  };
};