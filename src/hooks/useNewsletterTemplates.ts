import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export interface NewsletterTemplate {
  id: string;
  organization_id: string;
  name: string;
  subject: string;
  content: string;
  cover_image_url: string | null;
  created_by: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useNewsletterTemplates = () => {
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

  const fetchTemplates = useCallback(async () => {
    if (!organization?.id) {
      setTemplates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('newsletter_templates')
      .select('*')
      .eq('organization_id', organization.id)
      .order('updated_at', { ascending: false });
    if (error) {
      console.error('Error fetching newsletter templates:', error);
      toast({ title: 'Templates failed to load', description: error.message, variant: 'destructive' });
    } else {
      setTemplates((data ?? []) as NewsletterTemplate[]);
    }
    setLoading(false);
  }, [organization?.id, toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const saveAsTemplate = async (input: { name: string; subject: string; content: string; coverImageUrl?: string | null }) => {
    if (!organization?.id) return null;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await (supabase as any)
      .from('newsletter_templates')
      .insert({
        organization_id: organization.id,
        name: input.name,
        subject: input.subject,
        content: input.content,
        cover_image_url: input.coverImageUrl ?? null,
        created_by: user?.id ?? null,
      })
      .select()
      .single();
    if (error) {
      toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
      return null;
    }
    toast({ title: 'Template Saved', description: `"${input.name}" is now in your template library.` });
    setTemplates(prev => [data as NewsletterTemplate, ...prev]);
    return data as NewsletterTemplate;
  };

  const deleteTemplate = async (templateId: string) => {
    const { error } = await (supabase as any).from('newsletter_templates').delete().eq('id', templateId);
    if (error) {
      toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
      return false;
    }
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({ title: 'Template Deleted' });
    return true;
  };

  // Stamp last_used_at when a user picks a template. Used to surface the most
  // recently-used templates first in the picker (handy for orgs with dozens
  // of templates and a small subset of regular sends).
  const markTemplateUsed = async (templateId: string) => {
    await (supabase as any)
      .from('newsletter_templates')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', templateId);
  };

  return { templates, loading, refetch: fetchTemplates, saveAsTemplate, deleteTemplate, markTemplateUsed };
};
