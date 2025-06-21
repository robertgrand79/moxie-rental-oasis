
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SettingsState } from './settings/types';

export const useSiteMetaTags = (settings: SettingsState) => {
  const location = useLocation();
  
  const siteTitle = settings.siteTitle || 'Moxie Vacation Rentals';
  const metaDescription = settings.metaDescription || 'Your Home Base for Living Like a Local in Eugene - Discover Eugene, Oregon through thoughtfully curated vacation rentals.';
  const ogTitle = settings.ogTitle || siteTitle;
  const ogDescription = settings.ogDescription || metaDescription;
  const ogImage = settings.ogImage || 'https://lovable.dev/opengraph-image-p98pqg.png';
  const favicon = settings.favicon || '/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png';

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
      updateMetaTag('og:image', ogImage);

    } catch (error) {
      console.error('SiteHead: Critical error in meta tags setup:', error);
    }
  }, [siteTitle, metaDescription, ogTitle, ogDescription, ogImage, favicon]);

  return { isHomePage };
};
