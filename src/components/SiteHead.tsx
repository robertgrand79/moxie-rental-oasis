import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { useEffect } from 'react';
import { sanitizeHtml } from '@/utils/security';

const SiteHead = () => {
  const { settings } = useStableSiteSettings();

  const siteTitle = settings.siteTitle || 'Moxie Vacation Rentals';
  const metaDescription = settings.metaDescription || 'Your Home Base for Living Like a Local in Eugene - Discover Eugene, Oregon through thoughtfully curated vacation rentals.';
  const ogTitle = settings.ogTitle || siteTitle;
  const ogDescription = settings.ogDescription || metaDescription;
  const ogImage = settings.ogImage || 'https://lovable.dev/opengraph-image-p98pqg.png';
  const favicon = settings.favicon || '/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png';
  const googleAnalyticsId = settings.googleAnalyticsId || '';
  const googleTagManagerId = settings.googleTagManagerId || '';
  const facebookPixelId = settings.facebookPixelId || '';
  const customHeaderScripts = settings.customHeaderScripts || '';
  const customFooterScripts = settings.customFooterScripts || '';
  const customCss = settings.customCss || '';

  // Security function to validate and sanitize scripts
  const sanitizeScript = (script: string): string => {
    // Remove potentially dangerous patterns
    const dangerousPatterns = [
      /document\.write/gi,
      /eval\(/gi,
      /Function\(/gi,
      /setTimeout\s*\(\s*["'].*["']/gi,
      /setInterval\s*\(\s*["'].*["']/gi,
      /<script[^>]*src=[^>]*>/gi
    ];

    let sanitized = script;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  };

  useEffect(() => {
    // Update document title
    document.title = siteTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', metaDescription);
    }

    // Update favicon
    let faviconLink = document.querySelector('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.setAttribute('rel', 'icon');
      document.head.appendChild(faviconLink);
    }
    faviconLink.setAttribute('href', favicon);

    // Update Open Graph tags
    let ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      ogTitleMeta.setAttribute('content', ogTitle);
    }

    let ogDescMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescMeta) {
      ogDescMeta.setAttribute('content', ogDescription);
    }

    let ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', ogImage);
    }

    // Enhanced Google Analytics setup with better error handling
    if (googleAnalyticsId && /^G-[A-Z0-9]+$/.test(googleAnalyticsId)) {
      const existingScript = document.querySelector(`script[src*="${googleAnalyticsId}"]`);
      
      if (!existingScript) {
        console.log('📊 SiteHead: Loading Google Analytics script for:', googleAnalyticsId);
        
        // Create and load the GA script
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
        
        // Add load event listeners for better debugging
        gaScript.onload = () => {
          console.log('✅ SiteHead: Google Analytics script loaded successfully');
        };
        
        gaScript.onerror = (error) => {
          console.error('❌ SiteHead: Error loading Google Analytics script:', error);
        };
        
        document.head.appendChild(gaScript);

        // Create the GA configuration script
        const gaConfigScript = document.createElement('script');
        gaConfigScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAnalyticsId}');
          console.log('📊 SiteHead: Google Analytics configured for ${googleAnalyticsId}');
        `;
        document.head.appendChild(gaConfigScript);
        
        // Dispatch event to notify analytics service
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ga-script-loaded', { 
            detail: { gaId: googleAnalyticsId } 
          }));
        }, 100);
      } else {
        console.log('📊 SiteHead: Google Analytics script already exists');
      }
    } else if (googleAnalyticsId) {
      console.warn('⚠️ SiteHead: Invalid Google Analytics ID format:', googleAnalyticsId);
    }

    // Add Google Tag Manager (if valid GTM ID format)
    if (googleTagManagerId && /^GTM-[A-Z0-9]+$/.test(googleTagManagerId) && !document.querySelector(`script[src*="${googleTagManagerId}"]`)) {
      const gtmScript = document.createElement('script');
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${googleTagManagerId}');
      `;
      document.head.appendChild(gtmScript);
    }

    // Add Facebook Pixel (if valid pixel ID format)
    if (facebookPixelId && /^[0-9]+$/.test(facebookPixelId) && !document.querySelector(`script[src*="connect.facebook.net"]`)) {
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // Add custom header scripts (sanitized)
    if (customHeaderScripts) {
      const sanitizedHeaderScripts = sanitizeScript(customHeaderScripts);
      if (sanitizedHeaderScripts.trim()) {
        const customScript = document.createElement('script');
        customScript.innerHTML = sanitizedHeaderScripts;
        document.head.appendChild(customScript);
      }
    }

    // Add custom CSS (sanitized)
    if (customCss) {
      let customStyle = document.querySelector('#custom-site-css');
      if (!customStyle) {
        customStyle = document.createElement('style');
        customStyle.id = 'custom-site-css';
        document.head.appendChild(customStyle);
      }
      // Basic CSS sanitization - remove dangerous patterns
      const sanitizedCss = customCss
        .replace(/javascript:/gi, '')
        .replace(/expression\(/gi, '')
        .replace(/behavior:/gi, '')
        .replace(/@import/gi, '');
      customStyle.innerHTML = sanitizedCss;
    }

    // Add custom footer scripts (sanitized)
    if (customFooterScripts) {
      const sanitizedFooterScripts = sanitizeScript(customFooterScripts);
      if (sanitizedFooterScripts.trim()) {
        const footerScript = document.createElement('script');
        footerScript.innerHTML = sanitizedFooterScripts;
        document.body.appendChild(footerScript);
      }
    }

  }, [siteTitle, metaDescription, ogTitle, ogDescription, ogImage, favicon, googleAnalyticsId, googleTagManagerId, facebookPixelId, customHeaderScripts, customFooterScripts, customCss]);

  return null;
};

export default SiteHead;
