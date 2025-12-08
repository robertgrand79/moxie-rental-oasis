
import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

const ContactInfo = () => {
  const { tenantId } = useTenant();

  const { data: settings } = useQuery({
    queryKey: ['contact-info-settings', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['contactEmail', 'phone', 'address']);

      if (tenantId) {
        query = query.eq('organization_id', tenantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('ContactInfo: Error fetching settings:', error);
        throw error;
      }

      const settingsMap = data?.reduce((acc, setting) => {
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      return {
        contactEmail: settingsMap.contactEmail || '',
        phone: settingsMap.phone || '',
        address: settingsMap.address || ''
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: 3
  });

  const currentSettings = settings || {
    contactEmail: '',
    phone: '',
    address: ''
  };

  // Don't render sections without data
  const hasEmail = !!currentSettings.contactEmail;
  const hasPhone = !!currentSettings.phone;
  const hasAddress = !!currentSettings.address;

  if (!hasEmail && !hasPhone && !hasAddress) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
      {/* Visit Us */}
      {hasAddress && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Visit Us</h3>
          <p className="text-muted-foreground whitespace-pre-line">
            {currentSettings.address}
          </p>
        </div>
      )}

      {/* Call Us */}
      {hasPhone && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Phone className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Call Us</h3>
          <p className="text-muted-foreground">
            {currentSettings.phone}
          </p>
        </div>
      )}

      {/* Email Us */}
      {hasEmail && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Email Us</h3>
          <p className="text-muted-foreground">
            {currentSettings.contactEmail}
          </p>
        </div>
      )}

      {/* Support */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Support</h3>
        <p className="text-muted-foreground">
          24/7 Guest Support
        </p>
      </div>
    </div>
  );
};

export default ContactInfo;
