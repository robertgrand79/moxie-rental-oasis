
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Default values to use as fallback
const DEFAULT_SETTINGS = {
  siteName: 'Moxie Vacation Rentals',
  description: 'Discover Eugene, Oregon through thoughtfully curated vacation rentals in the heart of the Pacific Northwest.',
  contactEmail: 'contact@moxievacationrentals.com',
  phone: '+1 (555) 123-4567',
  address: '123 Vacation St, Eugene, OR 97401',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    googlePlaces: ''
  }
};

const Footer = () => {
  // Always fetch settings from database
  const { data: settings } = useQuery({
    queryKey: ['footer-settings'],
    queryFn: async () => {
      console.log('Fetching footer settings from database...');
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'siteName',
          'description',
          'contactEmail',
          'phone',
          'address',
          'socialMedia'
        ]);

      if (error) {
        console.error('Error fetching footer settings:', error);
        return DEFAULT_SETTINGS;
      }

      console.log('Raw footer settings from database:', data);

      // Convert array to object and handle empty/null values properly
      const settingsMap = data?.reduce((acc, setting) => {
        // Only use database value if it's not null, undefined, or empty string
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          if (setting.key === 'socialMedia') {
            // Handle JSON parsing for socialMedia
            try {
              acc[setting.key] = typeof setting.value === 'string' 
                ? JSON.parse(setting.value) 
                : setting.value;
            } catch (parseError) {
              console.warn(`Failed to parse socialMedia:`, parseError);
              acc[setting.key] = setting.value;
            }
          } else {
            acc[setting.key] = setting.value;
          }
        }
        return acc;
      }, {} as Record<string, any>) || {};

      console.log('Processed footer settings (non-empty values only):', settingsMap);

      // Merge with defaults - database values override defaults only if they exist and are not empty
      const finalSettings = {
        ...DEFAULT_SETTINGS,
        ...settingsMap,
        socialMedia: {
          ...DEFAULT_SETTINGS.socialMedia,
          ...(settingsMap.socialMedia || {})
        }
      };

      console.log('Final footer settings with defaults:', finalSettings);
      return finalSettings;
    },
    // Cache for 30 seconds to reduce database calls
    staleTime: 30000
  });

  // Use fetched settings or fallback to defaults
  const currentSettings = settings || DEFAULT_SETTINGS;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{currentSettings.siteName}</h3>
            <p className="text-gray-300 mb-4">
              {currentSettings.description}
            </p>
            <div className="flex space-x-4">
              {currentSettings.socialMedia?.facebook && (
                <a href={currentSettings.socialMedia.facebook} className="text-gray-300 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {currentSettings.socialMedia?.instagram && (
                <a href={currentSettings.socialMedia.instagram} className="text-gray-300 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {currentSettings.socialMedia?.twitter && (
                <a href={currentSettings.socialMedia.twitter} className="text-gray-300 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/properties" className="text-gray-300 hover:text-white">Properties</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">About</Link></li>
              <li><Link to="/experiences" className="text-gray-300 hover:text-white">Experiences</Link></li>
              <li><Link to="/events" className="text-gray-300 hover:text-white">Events</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-300 text-sm">{currentSettings.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-300 text-sm">{currentSettings.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-300 text-sm">{currentSettings.contactEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {currentSettings.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
