import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { normalizeSettingsKeys, ALL_SETTING_KEYS } from '@/utils/settingsNormalization';

// Default values to use as fallback - generic placeholders
const DEFAULT_SETTINGS = {
  siteName: 'Vacation Rentals',
  description: 'Discover amazing vacation rental properties.',
  contactEmail: '',
  phone: '',
  address: '',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
  }
};

const Footer = () => {
  const { tenantId } = useTenant();

  const { data: settings } = useQuery({
    queryKey: ['footer-settings', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ALL_SETTING_KEYS);

      // Filter by tenant if available
      if (tenantId) {
        query = query.eq('organization_id', tenantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Footer: Error fetching settings:', error);
        return DEFAULT_SETTINGS;
      }

      // Convert array to object and handle empty/null values properly
      const settingsMap = data?.reduce((acc, setting) => {
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          if (setting.key === 'socialMedia') {
            try {
              acc[setting.key] = typeof setting.value === 'string' 
                ? JSON.parse(setting.value) 
                : setting.value;
            } catch (parseError) {
              acc[setting.key] = setting.value;
            }
          } else {
            acc[setting.key] = setting.value;
          }
        }
        return acc;
      }, {} as Record<string, any>) || {};

      // Normalize keys to handle both camelCase and snake_case
      const normalized = normalizeSettingsKeys(settingsMap);

      // Merge with defaults
      const finalSettings = {
        siteName: normalized.siteName || DEFAULT_SETTINGS.siteName,
        description: normalized.description || DEFAULT_SETTINGS.description,
        contactEmail: normalized.contactEmail || DEFAULT_SETTINGS.contactEmail,
        phone: normalized.phone || DEFAULT_SETTINGS.phone,
        address: normalized.address || DEFAULT_SETTINGS.address,
        socialMedia: {
          ...DEFAULT_SETTINGS.socialMedia,
          ...normalized.socialMedia
        }
      };

      return finalSettings;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: 3
  });

  // Use fetched settings or fallback to defaults
  const currentSettings = settings || DEFAULT_SETTINGS;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{currentSettings.siteName}</h3>
            <p className="text-footer-muted mb-4">
              {currentSettings.description}
            </p>
            <div className="flex space-x-4">
              {currentSettings.socialMedia?.facebook && (
                <a href={currentSettings.socialMedia.facebook} className="text-footer-muted hover:text-footer-foreground transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {currentSettings.socialMedia?.instagram && (
                <a href={currentSettings.socialMedia.instagram} className="text-footer-muted hover:text-footer-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {currentSettings.socialMedia?.twitter && (
                <a href={currentSettings.socialMedia.twitter} className="text-footer-muted hover:text-footer-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-footer-muted hover:text-footer-foreground transition-colors">Home</Link></li>
              <li><Link to="/properties" className="text-footer-muted hover:text-footer-foreground transition-colors">Properties</Link></li>
              <li><Link to="/about" className="text-footer-muted hover:text-footer-foreground transition-colors">About</Link></li>
              <li><Link to="/experiences" className="text-footer-muted hover:text-footer-foreground transition-colors">Experiences</Link></li>
              <li><Link to="/events" className="text-footer-muted hover:text-footer-foreground transition-colors">Events</Link></li>
              <li><Link to="/contact" className="text-footer-muted hover:text-footer-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-footer-muted hover:text-footer-foreground transition-colors">Blog</Link></li>
              <li><Link to="/faq" className="text-footer-muted hover:text-footer-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="text-footer-muted hover:text-footer-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-footer-muted hover:text-footer-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-footer-muted" />
                <span className="text-footer-muted text-sm">{currentSettings.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-footer-muted" />
                <span className="text-footer-muted text-sm">{currentSettings.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-footer-muted" />
                <span className="text-footer-muted text-sm">{currentSettings.contactEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-footer-border mt-8 pt-8 text-center">
          <p className="text-footer-muted text-sm">
            © {currentYear} {currentSettings.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
