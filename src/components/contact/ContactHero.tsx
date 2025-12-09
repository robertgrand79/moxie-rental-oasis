
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

const ContactHero = () => {
  const { tenantId } = useTenant();

  const { data: settings } = useQuery({
    queryKey: ['contact-hero-settings', tenantId],
    queryFn: async () => {
      // Query both camelCase and snake_case key conventions
      let query = supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['siteName', 'site_name', 'contactEmail', 'contact_email', 'phone', 'contact_phone', 'address']);

      if (tenantId) {
        query = query.eq('organization_id', tenantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('ContactHero: Error fetching settings:', error);
        throw error;
      }

      const settingsMap = data?.reduce((acc, setting) => {
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      // Normalize to handle both key conventions
      const finalSettings = {
        siteName: settingsMap.siteName || settingsMap.site_name || 'Vacation Rentals',
        contactEmail: settingsMap.contactEmail || settingsMap.contact_email || '',
        phone: settingsMap.phone || settingsMap.contact_phone || '',
        address: settingsMap.address || ''
      };

      return finalSettings;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: 3
  });

  const currentSettings = settings || {
    siteName: 'Vacation Rentals',
    contactEmail: '',
    phone: '',
    address: ''
  };

  return (
    <div className="relative bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to text-foreground py-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          
          {/* Quick Contact Cards - only show cards with data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {currentSettings.phone && (
              <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="bg-background/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-icon-emerald" />
                </div>
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-sm text-muted-foreground">{currentSettings.phone}</p>
              </div>
            )}
            
            {currentSettings.contactEmail && (
              <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="bg-background/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-icon-amber" />
                </div>
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-sm text-muted-foreground">{currentSettings.contactEmail}</p>
              </div>
            )}
            
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="bg-background/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-icon-purple" />
              </div>
              <h3 className="font-semibold mb-2">Support</h3>
              <p className="text-sm text-muted-foreground">24/7 Guest Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHero;
