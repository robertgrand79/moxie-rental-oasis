import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';

const ContactBranding = () => {
  const { tenantId } = useTenant();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['contact-branding-settings', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', tenantId);
      
      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      data?.forEach(item => {
        settingsMap[item.key] = String(item.value ?? '');
      });
      
      return {
        siteLogo: settingsMap['siteLogo'] || settingsMap['site_logo'] || '',
        siteName: settingsMap['siteName'] || settingsMap['site_name'] || '',
        tagline: settingsMap['tagline'] || '',
        description: settingsMap['description'] || settingsMap['siteDescription'] || '',
      };
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-24 rounded-lg" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {settings?.siteLogo && (
        <div className="mb-6">
          <img 
            src={settings.siteLogo} 
            alt={settings.siteName || 'Site logo'} 
            className="h-20 w-auto object-contain"
          />
        </div>
      )}
      
      {settings?.siteName && (
        <h2 className="text-2xl font-bold text-foreground">
          {settings.siteName}
        </h2>
      )}
      
      {settings?.tagline && (
        <p className="text-lg text-muted-foreground">
          {settings.tagline}
        </p>
      )}
      
      <div className="pt-4 border-t border-border">
        <p className="text-muted-foreground leading-relaxed">
          {settings?.description || "We'd love to hear from you. Whether you have questions about our properties, need assistance with a booking, or just want to say hello, our team is here to help."}
        </p>
      </div>
      
      <div className="pt-4">
        <p className="text-sm text-muted-foreground italic">
          We typically respond within 24 hours.
        </p>
      </div>
    </div>
  );
};

export default ContactBranding;
