
import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ContactInfo = () => {
  const { data: settings } = useQuery({
    queryKey: ['contact-info-settings'],
    queryFn: async () => {
      console.log('🔄 ContactInfo: Fetching settings from database...');
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['contactEmail', 'phone', 'address']);

      if (error) {
        console.error('❌ ContactInfo: Error fetching settings:', error);
        throw error;
      }

      console.log('📄 ContactInfo: Raw settings:', data);

      const settingsMap = data?.reduce((acc, setting) => {
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      const finalSettings = {
        contactEmail: settingsMap.contactEmail || 'team@moxievacationrentals.com',
        phone: settingsMap.phone || '+1 541-255-1698',
        address: settingsMap.address || '2472 Willamette St\nEugene OR 97405'
      };

      console.log('✅ ContactInfo: Final settings:', finalSettings);
      return finalSettings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    retry: 3
  });

  const currentSettings = settings || {
    contactEmail: 'team@moxievacationrentals.com',
    phone: '+1 541-255-1698',
    address: '2472 Willamette St\nEugene OR 97405'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
      {/* Visit Us */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Visit Us</h3>
        <p className="text-muted-foreground whitespace-pre-line">
          {currentSettings.address}
        </p>
      </div>

      {/* Call Us */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Phone className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Call Us</h3>
        <p className="text-muted-foreground">
          {currentSettings.phone}
        </p>
      </div>

      {/* Email Us */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Email Us</h3>
        <p className="text-muted-foreground">
          {currentSettings.contactEmail}
        </p>
      </div>

      {/* Support */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-purple-600" />
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
