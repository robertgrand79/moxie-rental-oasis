import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HeaderConfig, FooterConfig } from '@/components/admin/newsletter/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

interface GlobalNewsletterSettings {
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
}

export const useGlobalNewsletterSettings = () => {
  const { organization } = useCurrentOrganization();
  
  // Generic defaults - no company-specific values
  const [settings, setSettings] = useState<GlobalNewsletterSettings>({
    headerConfig: {
      title: '',
      subtitle: '',
      background_gradient: {
        from: 'hsl(220, 8%, 85%)',
        to: 'hsl(220, 3%, 97%)'
      },
      text_color: 'hsl(222.2, 47.4%, 11.2%)',
      logo_url: ''
    },
    footerConfig: {
      company_name: '',
      tagline: '',
      contact_info: {
        email: '',
        location: ''
      },
      links: [
        { text: 'Visit Our Website', url: '#' },
        { text: 'View Properties', url: '#' }
      ],
      legal_links: [
        { text: 'Unsubscribe', url: '#' },
        { text: 'Update Preferences', url: '#' }
      ],
      social_media: {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load global settings from site_settings table
  const loadSettings = async () => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', organization.id)
        .in('key', ['newsletter_header_config', 'newsletter_footer_config']);

      if (error) throw error;

      const newSettings = { ...settings };

      data?.forEach((setting) => {
        if (setting.key === 'newsletter_header_config') {
          newSettings.headerConfig = setting.value as any;
        }
        if (setting.key === 'newsletter_footer_config') {
          newSettings.footerConfig = setting.value as any;
        }
      });

      setSettings(newSettings);
    } catch (error) {
      console.error('Error loading global newsletter settings:', error);
      toast({
        title: "Settings Load Error",
        description: "Failed to load global newsletter settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save settings to site_settings table
  const saveSettings = async (newSettings: GlobalNewsletterSettings) => {
    if (!organization?.id) {
      toast({
        title: "Error",
        description: "No organization context available.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setSaving(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update header config with organization_id
      const { error: headerError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'newsletter_header_config',
          value: newSettings.headerConfig as any,
          created_by: user.id,
          organization_id: organization.id
        }, {
          onConflict: 'key,organization_id'
        });

      if (headerError) throw headerError;

      // Update footer config with organization_id
      const { error: footerError } = await supabase
        .from('site_settings')
        .upsert({
          key: 'newsletter_footer_config',
          value: newSettings.footerConfig as any,
          created_by: user.id,
          organization_id: organization.id
        }, {
          onConflict: 'key,organization_id'
        });

      if (footerError) throw footerError;

      setSettings(newSettings);
      
      toast({
        title: "Settings Saved",
        description: "Global newsletter settings have been updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving global newsletter settings:', error);
      toast({
        title: "Save Error",
        description: "Failed to save global newsletter settings.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Update header config
  const updateHeaderConfig = (headerConfig: HeaderConfig) => {
    const newSettings = { ...settings, headerConfig };
    return saveSettings(newSettings);
  };

  // Update footer config
  const updateFooterConfig = (footerConfig: FooterConfig) => {
    const newSettings = { ...settings, footerConfig };
    return saveSettings(newSettings);
  };

  useEffect(() => {
    loadSettings();
  }, [organization?.id]);

  return {
    settings,
    loading,
    saving,
    updateHeaderConfig,
    updateFooterConfig,
    refreshSettings: loadSettings
  };
};
