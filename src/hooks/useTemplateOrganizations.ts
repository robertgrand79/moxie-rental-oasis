import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TemplateType = 'single_property' | 'multi_property';

export interface TemplateOrganization {
  id: string;
  name: string;
  slug: string;
  template_type: TemplateType;
  logo_url: string | null;
}

export const useTemplateOrganizations = () => {
  return useQuery({
    queryKey: ['template-organizations'],
    queryFn: async (): Promise<TemplateOrganization[]> => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, template_type, logo_url')
        .eq('is_template', true)
        .eq('is_active', true)
        .order('template_type', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(org => ({
        ...org,
        template_type: (org.template_type as TemplateType) || 'multi_property',
      }));
    },
  });
};
