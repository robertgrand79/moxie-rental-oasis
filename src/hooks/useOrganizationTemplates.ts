import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TemplateType = 'single_property' | 'multi_property';

export interface PricingTier {
  id: string;
  name: string;
  slug: string;
  monthly_price_cents: number;
  annual_price_cents: number | null;
  stripe_price_id: string | null;
  stripe_annual_price_id: string | null;
  features: string[];
}

export interface DemoDataConfig {
  copy_properties?: boolean;
  copy_reservations?: boolean;
  copy_blog_posts?: boolean;
  copy_pages?: boolean;
  copy_events?: boolean;
  copy_testimonials?: boolean;
  copy_points_of_interest?: boolean;
  copy_lifestyle_gallery?: boolean;
  copy_message_templates?: boolean;
  copy_checklist_templates?: boolean;
}

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
  // Unified template fields
  pricing_tier_id: string | null;
  source_organization_id: string | null;
  include_demo_data: boolean;
  demo_data_config: DemoDataConfig;
  // New template source fields
  preview_url: string | null;
  preview_images: string[];
  feature_highlights: string[];
  recommended_for: string[];
  // Joined pricing tier data
  pricing_tier: PricingTier | null;
}

export const useOrganizationTemplates = () => {
  return useQuery({
    queryKey: ['organization-templates'],
    queryFn: async (): Promise<OrganizationTemplate[]> => {
      const { data, error } = await supabase
        .from('organization_templates')
        .select(`
          *,
          pricing_tier:site_templates!pricing_tier_id (
            id,
            name,
            slug,
            monthly_price_cents,
            annual_price_cents,
            stripe_price_id,
            stripe_annual_price_id,
            features
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(template => ({
        ...template,
        template_type: template.template_type as TemplateType,
        features: (template.features as string[]) || [],
        default_settings: (template.default_settings as Record<string, unknown>) || {},
        include_demo_data: template.include_demo_data ?? false,
        demo_data_config: (template.demo_data_config as DemoDataConfig) || {},
        preview_images: (template.preview_images as string[]) || [],
        feature_highlights: (template.feature_highlights as string[]) || [],
        recommended_for: template.recommended_for || [],
        pricing_tier: template.pricing_tier as PricingTier | null,
      }));
    },
  });
};
export const useOrganizationTemplate = (templateId: string | null) => {
  return useQuery({
    queryKey: ['organization-template', templateId],
    queryFn: async (): Promise<OrganizationTemplate | null> => {
      if (!templateId) return null;
      
      const { data, error } = await supabase
        .from('organization_templates')
        .select(`
          *,
          pricing_tier:site_templates!pricing_tier_id (
            id,
            name,
            slug,
            monthly_price_cents,
            annual_price_cents,
            stripe_price_id,
            stripe_annual_price_id,
            features
          )
        `)
        .eq('id', templateId)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        template_type: data.template_type as TemplateType,
        features: (data.features as string[]) || [],
        default_settings: (data.default_settings as Record<string, unknown>) || {},
        include_demo_data: data.include_demo_data ?? false,
        demo_data_config: (data.demo_data_config as DemoDataConfig) || {},
        preview_images: (data.preview_images as string[]) || [],
        feature_highlights: (data.feature_highlights as string[]) || [],
        recommended_for: data.recommended_for || [],
        pricing_tier: data.pricing_tier as PricingTier | null,
      };
    },
    enabled: !!templateId,
  });
};
