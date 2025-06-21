

import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { useHeroSettings } from '@/components/home/hooks/useHeroSettings';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sanitizeHtml } from '@/utils/security';

const SiteHead = () => {
  const { settings } = useStableSiteSettings();
  const { settings: heroSettings } = useHeroSettings();
  const location = useLocation();

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

  // Check if we're on the home page for hero image preloading
  const isHomePage = location.pathname === '/';

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

      // Only preload hero image on home page to reduce console warnings
      if (isHomePage && heroSettings.heroBackgroundImage && heroSettings.heroBackgroundImage.trim() !== '') {
        let heroPreload = document.querySelector('link[rel="preload"][data-hero-image]');
        if (!heroPreload) {
          heroPreload = document.createElement('link');
          heroPreload.setAttribute('rel', 'preload');
          heroPreload.setAttribute('as', 'image');
          heroPreload.setAttribute('data-hero-image', 'true');
          
          // Add error handling for preload
          heroPreload.addEventListener('error', () => {
            console.warn('🖼️ Hero image preload failed, but this is not critical');
          });
          
          document.head.appendChild(heroPreload);
        }
        heroPreload.setAttribute('href', heroSettings.heroBackgroundImage);
        console.log('🚀 Preloading hero image:', heroSettings.heroBackgroundImage);
      } else if (!isHomePage) {
        // Remove hero preload on non-home pages
        const existingPreload = document.querySelector('link[rel="preload"][data-hero-image]');
        if (existingPreload) {
          existingPreload.remove();
        }
      }

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

      // Enhanced Google Analytics setup with improved timing and event coordination
      if (googleAnalyticsId && /^G-[A-Z0-9]+$/.test(googleAnalyticsId)) {
        const existingScript = document.querySelector(`script[src*="${googleAnalyticsId}"]`);
        
        if (!existingScript) {
          console.log('📊 SiteHead: Loading Google Analytics script for:', googleAnalyticsId);
          
          // Create and load the GA script with improved error handling
          const gaScript = document.createElement('script');
          gaScript.async = true;
          gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
          gaScript.setAttribute('data-ga-id', googleAnalyticsId);
          
          // Enhanced load event handling with better timing
          gaScript.onload = () => {
            console.log('✅ SiteHead: Google Analytics script loaded successfully');
            
            // Wait for gtag to be fully available before dispatching event
            const checkGtagAndDispatch = (attempt: number = 1) => {
              if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function') {
                console.log(`📊 SiteHead: gtag function confirmed available (attempt ${attempt}), dispatching event`);
                
                // Dispatch event with slight delay to ensure everything is ready
                setTimeout(() => {
                  const event = new CustomEvent('ga-script-loaded', { 
                    detail: { 
                      gaId: googleAnalyticsId,
                      timestamp: Date.now(),
                      attempt: attempt
                    } 
                  });
                  window.dispatchEvent(event);
                  console.log('📊 SiteHead: ga-script-loaded event dispatched for', googleAnalyticsId);
                }, 150);
              } else if (attempt < 20) {
                console.log(`📊 SiteHead: gtag not yet available (attempt ${attempt}), checking again...`);
                setTimeout(() => checkGtagAndDispatch(attempt + 1), 200);
              } else {
                console.warn('📊 SiteHead: gtag function not available after maximum attempts');
              }
            };
            
            // Start checking for gtag availability
            setTimeout(() => checkGtagAndDispatch(1), 100);
          };
          
          gaScript.onerror = (error) => {
            console.error('❌ SiteHead: Error loading Google Analytics script:', error);
          };
          
          document.head.appendChild(gaScript);

          // Create the GA configuration script with improved timing and error handling
          const gaConfigScript = document.createElement('script');
          gaConfigScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            try {
              gtag('config', '${googleAnalyticsId}', {
                send_page_view: true,
                debug_mode: false
              });
              console.log('📊 SiteHead: Google Analytics configured successfully for ${googleAnalyticsId}');
            } catch (error) {
              console.error('❌ SiteHead: Error configuring Google Analytics:', error);
            }
          `;
          document.head.appendChild(gaConfigScript);
          
        } else {
          console.log('📊 SiteHead: Google Analytics script already exists, checking gtag availability...');
          
          // If script already exists, still dispatch event in case service is waiting
          setTimeout(() => {
            if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function') {
              const event = new CustomEvent('ga-script-loaded', { 
                detail: { 
                  gaId: googleAnalyticsId,
                  timestamp: Date.now(),
                  existingScript: true
                } 
              });
              window.dispatchEvent(event);
              console.log('📊 SiteHead: ga-script-loaded event dispatched for existing script');
            } else {
              console.warn('📊 SiteHead: Existing script found but gtag not available');
            }
          }, 500);
        }
      } else if (googleAnalyticsId) {
        console.warn('⚠️ SiteHead: Invalid Google Analytics ID format:', googleAnalyticsId);
      }

      // Add Google Tag Manager (if valid GTM ID format)
      if (googleTagManagerId && /^GTM-[A-Z0-9]+$/.test(googleTagManagerId) && !document.querySelector(`script[src*="${googleTagManagerId}"]`)) {
        try {
          const gtmScript = document.createElement('script');
          gtmScript.innerHTML = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${googleTagManagerId}');
          `;
          document.head.appendChild(gtmScript);
        } catch (error) {
          console.warn('GTM script loading failed:', error);
        }
      }

      // Add Facebook Pixel (only if valid pixel ID is configured and not already loaded)
      if (facebookPixelId && facebookPixelId.trim() !== '' && /^[0-9]+$/.test(facebookPixelId.trim())) {
        const existingFbScript = document.querySelector(`script[data-fb-pixel="${facebookPixelId.trim()}"]`);
        
        if (!existingFbScript) {
          try {
            console.log('📱 SiteHead: Loading Facebook Pixel for ID:', facebookPixelId);
            
            const fbScript = document.createElement('script');
            fbScript.setAttribute('data-fb-pixel', facebookPixelId.trim());
            fbScript.innerHTML = `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              try {
                fbq('init', '${facebookPixelId.trim()}');
                fbq('track', 'PageView');
              } catch (fbError) {
                console.warn('Facebook Pixel initialization failed:', fbError);
              }
            `;
            document.head.appendChild(fbScript);
          } catch (error) {
            console.warn('Facebook Pixel script creation failed:', error);
          }
        }
      } else if (facebookPixelId && facebookPixelId.trim() !== '' && !/^[0-9]+$/.test(facebookPixelId.trim())) {
        console.warn('⚠️ SiteHead: Invalid Facebook Pixel ID format:', facebookPixelId);
      }

      // Add custom header scripts (sanitized)
      if (customHeaderScripts) {
        try {
          const sanitizedHeaderScripts = sanitizeScript(customHeaderScripts);
          if (sanitizedHeaderScripts.trim()) {
            const customScript = document.createElement('script');
            customScript.innerHTML = sanitizedHeaderScripts;
            document.head.appendChild(customScript);
          }
        } catch (error) {
          console.warn('Custom header scripts failed to load:', error);
        }
      }

      // Add custom CSS (sanitized)
      if (customCss) {
        try {
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
        } catch (error) {
          console.warn('Custom CSS failed to load:', error);
        }
      }

      // Add custom footer scripts (sanitized)
      if (customFooterScripts) {
        try {
          const sanitizedFooterScripts = sanitizeScript(customFooterScripts);
          if (sanitizedFooterScripts.trim()) {
            const footerScript = document.createElement('script');
            footerScript.innerHTML = sanitizedFooterScripts;
            document.body.appendChild(footerScript);
          }
        } catch (error) {
          console.warn('Custom footer scripts failed to load:', error);
        }
      }

    } catch (error) {
      console.error('SiteHead: Critical error in useEffect:', error);
    }

  }, [siteTitle, metaDescription, ogTitle, ogDescription, ogImage, favicon, googleAnalyticsId, googleTagManagerId, facebookPixelId, customHeaderScripts, customFooterScripts, customCss, heroSettings.heroBackgroundImage, isHomePage]);

  return null;
};

export default SiteHead;
