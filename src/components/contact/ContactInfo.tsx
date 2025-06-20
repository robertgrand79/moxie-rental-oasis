
import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ContactInfo = () => {
  // Force fresh data fetch every time with timestamp-based cache busting
  const { data: settings } = useQuery({
    queryKey: ['contact-info-settings', Date.now()], // Always fresh
    queryFn: async () => {
      console.log('🔄 ContactInfo: Fetching fresh settings from database...');
      
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

      // Use current database values with updated defaults
      const finalSettings = {
        contactEmail: settingsMap.contactEmail || 'gabby@moxievacationrental.com',
        phone: settingsMap.phone || '+1 541-255-1698',
        address: settingsMap.address || '2472 Willamette St Eugene OR 97405'
      };

      console.log('✅ ContactInfo: Final settings:', finalSettings);
      return finalSettings;
    },
    staleTime: 0, // Never consider data stale
    gcTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const currentSettings = settings || {
    contactEmail: 'gabby@moxievacationrental.com',
    phone: '+1 541-255-1698',
    address: '2472 Willamette St Eugene OR 97405'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Get in touch with us. We're here to help!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-medium">Phone</span>
              <span className="text-gray-600">{currentSettings.phone}</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Mail className="h-5 w-5 text-primary" />
              <span className="font-medium">Email</span>
              <span className="text-gray-600">{currentSettings.contactEmail}</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">Address</span>
              <span className="text-gray-600 text-center">
                {currentSettings.address}
              </span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Business Hours</span>
              <span className="text-gray-600 text-center">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday - Sunday: 10:00 AM - 4:00 PM
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfo;
