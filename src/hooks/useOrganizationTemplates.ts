import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TemplateType = 'single_property' | 'multi_property';

export interface OrganizationTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  template_type: TemplateType;
  preview_image_url: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  display_order: number;
  features: string[];
  default_settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const useOrganizationTemplates = () => {
  return useQuery({
    queryKey: ['organization-templates'],
    queryFn: async (): Promise<OrganizationTemplate[]> => {
      const { data, error } = await supabase
        .from('organization_templates')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(template => ({
        ...template,
        template_type: template.template_type as TemplateType,
        features: (template.features as string[]) || [],
        default_settings: (template.default_settings as Record<string, unknown>) || {},
      }));
    },
  });
};
