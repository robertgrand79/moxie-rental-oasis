
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const ContactHero = () => {
  // Fetch contact settings directly from database with no caching
  const { data: settings } = useQuery({
    queryKey: ['contact-hero-settings', new Date().getMinutes()], // Cache busting with minute precision
    queryFn: async () => {
      console.log('Fetching contact hero settings from database...');
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['siteName', 'contactEmail', 'phone', 'address']);

      if (error) {
        console.error('Error fetching contact hero settings:', error);
        throw error;
      }

      console.log('Raw contact hero settings:', data);

      const settingsMap = data?.reduce((acc, setting) => {
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      // Use current database values with updated defaults
      const finalSettings = {
        siteName: settingsMap.siteName || 'Moxie Vacation Rentals',
        contactEmail: settingsMap.contactEmail || 'gabby@moxievacationrental.com',
        phone: settingsMap.phone || '+1 541-255-1698',
        address: settingsMap.address || '2472 Willamette St Eugene OR 97405'
      };

      console.log('Final contact hero settings:', finalSettings);
      return finalSettings;
    },
    staleTime: 0, // No caching
    refetchInterval: false
  });

  const currentSettings = settings || {
    siteName: 'Moxie Vacation Rentals',
    contactEmail: 'gabby@moxievacationrental.com',
    phone: '+1 541-255-1698',
    address: '2472 Willamette St Eugene OR 97405'
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
          
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="bg-background/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-icon-blue" />
              </div>
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-sm text-muted-foreground">{currentSettings.address}</p>
            </div>
            
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="bg-background/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-icon-emerald" />
              </div>
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-sm text-muted-foreground">{currentSettings.phone}</p>
            </div>
            
            <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="bg-background/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-icon-amber" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground">{currentSettings.contactEmail}</p>
            </div>
            
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
