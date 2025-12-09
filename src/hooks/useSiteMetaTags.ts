
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SettingsState } from './settings/types';

export const useSiteMetaTags = (settings: SettingsState) => {
  const location = useLocation();
  
  // Use generic defaults instead of Moxie-specific branding
  const siteTitle = settings.siteTitle || 'Vacation Rentals';
  const metaDescription = settings.metaDescription || 'Discover vacation rentals in our beautiful area.';
  const ogTitle = settings.ogTitle || siteTitle;
  const ogDescription = settings.ogDescription || metaDescription;
  const ogImage = settings.ogImage || '';
  const favicon = settings.favicon || '/favicon.ico';

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    try {
      // Update document title
      document.title = siteTitle;

      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', metaDescription);
      }

      // Update favicon with error handling
      let faviconLink = document.querySelector('link[rel="icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.setAttribute('rel', 'icon');
        document.head.appendChild(faviconLink);
      }
      faviconLink.setAttribute('href', favicon);

      // Update Open Graph tags with error handling
      const updateMetaTag = (property: string, content: string) => {
        try {
          let metaTag = document.querySelector(`meta[property="${property}"]`);
          if (metaTag) {
            metaTag.setAttribute('content', content);
          }
        } catch (error) {
          console.warn(`Failed to update meta tag ${property}:`, error);
        }
      };

      updateMetaTag('og:title', ogTitle);
      updateMetaTag('og:description', ogDescription);
      if (ogImage) {
        updateMetaTag('og:image', ogImage);
      }

    } catch (error) {
      console.error('SiteHead: Critical error in meta tags setup:', error);
    }
  }, [siteTitle, metaDescription, ogTitle, ogDescription, ogImage, favicon]);

  return { isHomePage };
};
