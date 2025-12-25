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
  keywords: string;
  canonicalBase: string;
  twitterCardType: string;
  twitterSite: string;
}

const DEFAULT_SETTINGS: TenantMetaSettings = {
  siteTitle: 'Vacation Rentals',
  siteName: 'Vacation Rentals',
  favicon: '/favicon.ico',
  metaDescription: 'Discover vacation rentals.',
  ogTitle: 'Vacation Rentals',
  ogDescription: 'Discover vacation rentals.',
  ogImage: '',
  keywords: '',
  canonicalBase: '',
  twitterCardType: 'summary_large_image',
  twitterSite: '',
};

/**
 * Fetches and applies tenant-specific meta tags (title, favicon, OG tags, Twitter Cards)
 * Works for unauthenticated visitors using tenantId from TenantContext
 */
export const useTenantMetaTags = () => {
  const location = useLocation();
  const { tenantId, loading: tenantLoading } = useTenant();

  const { data: settings } = useQuery({
    queryKey: ['tenant-meta-tags', tenantId],
    queryFn: async (): Promise<TenantMetaSettings> => {
      if (!tenantId) {
        return DEFAULT_SETTINGS;
      }

      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', tenantId)
        .in('key', [
          'siteTitle', 'siteName', 'favicon', 'metaDescription', 
          'ogTitle', 'ogDescription', 'ogImage', 'keywords',
          'canonicalBase', 'twitterCardType', 'twitterSite'
        ]);

      if (error) {
        console.error('[TenantMetaTags] Error fetching settings:', error);
        return DEFAULT_SETTINGS;
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
        siteTitle: settingsMap.siteTitle || settingsMap.siteName || DEFAULT_SETTINGS.siteTitle,
        siteName: settingsMap.siteName || settingsMap.siteTitle || DEFAULT_SETTINGS.siteName,
        favicon: settingsMap.favicon || DEFAULT_SETTINGS.favicon,
        metaDescription: settingsMap.metaDescription || DEFAULT_SETTINGS.metaDescription,
        ogTitle: settingsMap.ogTitle || settingsMap.siteTitle || DEFAULT_SETTINGS.ogTitle,
        ogDescription: settingsMap.ogDescription || settingsMap.metaDescription || DEFAULT_SETTINGS.ogDescription,
        ogImage: settingsMap.ogImage || '',
        keywords: settingsMap.keywords || '',
        canonicalBase: settingsMap.canonicalBase || '',
        twitterCardType: settingsMap.twitterCardType || DEFAULT_SETTINGS.twitterCardType,
        twitterSite: settingsMap.twitterSite || '',
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

      // Helper to update or create meta tags
      const updateMetaTag = (selector: string, attribute: string, content: string) => {
        let metaTag = document.querySelector(selector) as HTMLMetaElement;
        if (!metaTag && content) {
          metaTag = document.createElement('meta');
          const [attrType, attrValue] = selector.match(/\[(\w+)="([^"]+)"\]/)?.slice(1) || [];
          if (attrType && attrValue) {
            metaTag.setAttribute(attrType, attrValue);
          }
          document.head.appendChild(metaTag);
        }
        if (metaTag) {
          metaTag.setAttribute(attribute, content);
        }
      };

      // Helper to update or create link tags
      const updateLinkTag = (selector: string, href: string) => {
        let linkTag = document.querySelector(selector) as HTMLLinkElement;
        if (!linkTag && href) {
          linkTag = document.createElement('link');
          const rel = selector.match(/rel="([^"]+)"/)?.[1];
          if (rel) {
            linkTag.setAttribute('rel', rel);
          }
          document.head.appendChild(linkTag);
        }
        if (linkTag) {
          linkTag.setAttribute('href', href);
        }
      };

      // Update meta description
      updateMetaTag('meta[name="description"]', 'content', settings.metaDescription);

      // Update keywords
      if (settings.keywords) {
        updateMetaTag('meta[name="keywords"]', 'content', settings.keywords);
      }

      // Update favicon
      updateLinkTag('link[rel="icon"]', settings.favicon);

      // Build canonical URL
      const currentUrl = window.location.href;
      const canonicalUrl = settings.canonicalBase 
        ? `${settings.canonicalBase.replace(/\/$/, '')}${location.pathname}`
        : currentUrl;
      updateLinkTag('link[rel="canonical"]', canonicalUrl);

      // Update Open Graph tags
      updateMetaTag('meta[property="og:title"]', 'content', settings.ogTitle);
      updateMetaTag('meta[property="og:description"]', 'content', settings.ogDescription);
      updateMetaTag('meta[property="og:site_name"]', 'content', settings.siteName);
      updateMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
      updateMetaTag('meta[property="og:type"]', 'content', 'website');
      if (settings.ogImage) {
        updateMetaTag('meta[property="og:image"]', 'content', settings.ogImage);
      }

      // Update Twitter Card tags
      updateMetaTag('meta[name="twitter:card"]', 'content', settings.twitterCardType);
      updateMetaTag('meta[name="twitter:title"]', 'content', settings.ogTitle);
      updateMetaTag('meta[name="twitter:description"]', 'content', settings.ogDescription);
      if (settings.twitterSite) {
        updateMetaTag('meta[name="twitter:site"]', 'content', settings.twitterSite);
      }
      if (settings.ogImage) {
        updateMetaTag('meta[name="twitter:image"]', 'content', settings.ogImage);
      }

    } catch (error) {
      console.error('[TenantMetaTags] Error updating meta tags:', error);
    }
  }, [settings, location.pathname]);

  return { isHomePage, settings };
};
