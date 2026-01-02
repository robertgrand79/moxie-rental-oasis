import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlatformSetting {
  id: string;
  key: string;
  value: string | null;
  is_secret: boolean;
  updated_at: string;
}

export interface SiteTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price_cents: number;
  annual_price_cents: number | null;
  max_properties: number | null;
  features: string[];
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  stripe_annual_price_id: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const usePlatformSettings = () => {
  const queryClient = useQueryClient();

  // Fetch platform settings
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data as PlatformSetting[];
    }
  });

  // Update platform setting
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('platform_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast.success('Setting updated');
    },
    onError: (error) => {
      console.error('Failed to update setting:', error);
      toast.error('Failed to update setting');
    }
  });

  // Fetch site templates
  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['site-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_templates')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as SiteTemplate[];
    }
  });

  // Update template
  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SiteTemplate> }) => {
      const { error } = await supabase
        .from('site_templates')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-templates'] });
      toast.success('Template updated');
    },
    onError: (error) => {
      console.error('Failed to update template:', error);
      toast.error('Failed to update template');
    }
  });

  // Create template
  const createTemplate = useMutation({
    mutationFn: async (template: Omit<SiteTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('site_templates')
        .insert(template);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-templates'] });
      toast.success('Template created');
    },
    onError: (error) => {
      console.error('Failed to create template:', error);
      toast.error('Failed to create template');
    }
  });

  // Helper to get setting value
  const getSetting = (key: string): string | null => {
    return settings?.find(s => s.key === key)?.value || null;
  };

  // Check if Stripe is configured
  const isStripeConfigured = () => {
    const secretKey = getSetting('platform_stripe_secret_key');
    return !!secretKey && secretKey.length > 0;
  };

  return {
    settings,
    loadingSettings,
    updateSetting,
    getSetting,
    isStripeConfigured,
    templates,
    loadingTemplates,
    updateTemplate,
    createTemplate,
    isUpdating: updateSetting.isPending || updateTemplate.isPending || createTemplate.isPending
  };
};
