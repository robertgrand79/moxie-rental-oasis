import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface TenantMetaSettings {
  siteTitle: string;
  siteName: string;
  favicon: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

/**
 * Fetches and applies tenant-specific meta tags (title, favicon, OG tags)
 * Works for unauthenticated visitors using tenantId from TenantContext
 */
export const useTenantMetaTags = () => {
  const location = useLocation();
  const { tenantId, loading: tenantLoading } = useTenant();

  const { data: settings } = useQuery({
    queryKey: ['tenant-meta-tags', tenantId],
    queryFn: async (): Promise<TenantMetaSettings> => {
      if (!tenantId) {
        return {
          siteTitle: 'Vacation Rentals',
          siteName: 'Vacation Rentals',
          favicon: '/favicon.ico',
          metaDescription: 'Discover vacation rentals.',
          ogTitle: 'Vacation Rentals',
          ogDescription: 'Discover vacation rentals.',
          ogImage: '',
        };
      }

      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', tenantId)
        .in('key', ['siteTitle', 'siteName', 'favicon', 'metaDescription', 'ogTitle', 'ogDescription', 'ogImage']);

      if (error) {
        console.error('[TenantMetaTags] Error fetching settings:', error);
        return {
          siteTitle: 'Vacation Rentals',
          siteName: 'Vacation Rentals',
          favicon: '/favicon.ico',
          metaDescription: 'Discover vacation rentals.',
          ogTitle: 'Vacation Rentals',
          ogDescription: 'Discover vacation rentals.',
          ogImage: '',
        };
      }

      const settingsMap: Record<string, string> = {};
      data?.forEach(row => {
        try {
          const parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          settingsMap[row.key] = parsed;
        } catch {
          settingsMap[row.key] = row.value as string;
        }
      });

      return {
        siteTitle: settingsMap.siteTitle || settingsMap.siteName || 'Vacation Rentals',
        siteName: settingsMap.siteName || settingsMap.siteTitle || 'Vacation Rentals',
        favicon: settingsMap.favicon || '/favicon.ico',
        metaDescription: settingsMap.metaDescription || 'Discover vacation rentals.',
        ogTitle: settingsMap.ogTitle || settingsMap.siteTitle || 'Vacation Rentals',
        ogDescription: settingsMap.ogDescription || settingsMap.metaDescription || 'Discover vacation rentals.',
        ogImage: settingsMap.ogImage || '',
      };
    },
    enabled: !tenantLoading,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!settings) return;

    try {
      // Update document title
      document.title = settings.siteTitle;

      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', settings.metaDescription);
      }

      // Update favicon
      let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.setAttribute('rel', 'icon');
        document.head.appendChild(faviconLink);
      }
      faviconLink.setAttribute('href', settings.favicon);

      // Update Open Graph tags
      const updateMetaTag = (property: string, content: string) => {
        const metaTag = document.querySelector(`meta[property="${property}"]`);
        if (metaTag) {
          metaTag.setAttribute('content', content);
        }
      };

      updateMetaTag('og:title', settings.ogTitle);
      updateMetaTag('og:description', settings.ogDescription);
      if (settings.ogImage) {
        updateMetaTag('og:image', settings.ogImage);
      }

    } catch (error) {
      console.error('[TenantMetaTags] Error updating meta tags:', error);
    }
  }, [settings]);

  return { isHomePage, settings };
};
