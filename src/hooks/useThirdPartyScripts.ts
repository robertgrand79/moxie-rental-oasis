import { useEffect } from 'react';
import DOMPurify from 'dompurify';

export const useThirdPartyScripts = (
  googleTagManagerId: string,
  facebookPixelId: string,
  customHeaderScripts: string,
  customFooterScripts: string,
  customCss: string
) => {
  // Security function to validate and sanitize scripts using DOMPurify
  const sanitizeScript = (script: string): string => {
    // Remove potentially dangerous patterns first
    const dangerousPatterns = [
      /document\.write/gi,
      /eval\(/gi,
      /Function\(/gi,
      /setTimeout\s*\(\s*["'].*["']/gi,
      /setInterval\s*\(\s*["'].*["']/gi,
      /<script[^>]*src=[^>]*>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,  // Event handlers like onclick=
    ];

    let sanitized = script;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Additional DOMPurify sanitization for any HTML content
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [], // Strip all HTML tags, keep only text/script content
      KEEP_CONTENT: true,
    });

    return sanitized;
  };

  // Comprehensive Facebook Pixel cleanup function
  const cleanupFacebookPixel = () => {
    console.log('🧹 SiteHead: Starting comprehensive Facebook Pixel cleanup');
    
    // Remove all Facebook Pixel related scripts
    const fbScripts = [
      'script[data-fb-pixel]',
      'script[src*="connect.facebook.net"]',
      'script[src*="fbevents.js"]',
      'script:not([src])'  // Inline scripts that might contain fbq
    ];
    
    fbScripts.forEach(selector => {
      const scripts = document.querySelectorAll(selector);
      scripts.forEach(script => {
        // For inline scripts, check if they contain fbq
        if (selector === 'script:not([src])' && script.innerHTML && script.innerHTML.includes('fbq')) {
          script.remove();
          console.log('🗑️ SiteHead: Removed inline Facebook Pixel script');
        } else if (selector !== 'script:not([src])') {
          script.remove();
          console.log('🗑️ SiteHead: Removed Facebook Pixel script:', selector);
        }
      });
    });
    
    // Clean up window object
    if (typeof window !== 'undefined') {
      const windowWithFb = window as Window & { 
        _fbq?: unknown; 
        fbq?: unknown; 
        dataLayer?: Array<Record<string, unknown>> 
      };
      
      // Remove fbq function
      if (windowWithFb.fbq) {
        delete windowWithFb.fbq;
        console.log('🗑️ SiteHead: Removed fbq from window object');
      }
      
      // Remove _fbq if it exists
      if (windowWithFb._fbq) {
        delete windowWithFb._fbq;
        console.log('🗑️ SiteHead: Removed _fbq from window object');
      }
      
      // Clear any Facebook Pixel related data from dataLayer if it exists
      if (windowWithFb.dataLayer) {
        windowWithFb.dataLayer = windowWithFb.dataLayer.filter((item) => 
          !(item && typeof item === 'object' && 'event' in item && typeof item.event === 'string' && item.event.includes('fb'))
        );
        console.log('🗑️ SiteHead: Cleaned Facebook events from dataLayer');
      }
    }
    
    console.log('✅ SiteHead: Facebook Pixel cleanup completed');
  };

  useEffect(() => {
    try {
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

      // Handle Facebook Pixel - comprehensive cleanup if disabled
      if (!facebookPixelId || facebookPixelId.trim() === '') {
        console.log('📱 SiteHead: Facebook Pixel disabled, performing comprehensive cleanup');
        cleanupFacebookPixel();
        
        // Set up a mutation observer to catch any new Facebook scripts that might be added
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.tagName === 'SCRIPT' && 
                    (element.hasAttribute('data-fb-pixel') || 
                     (element as HTMLScriptElement).src?.includes('connect.facebook.net') ||
                     element.innerHTML?.includes('fbq'))) {
                  console.log('🚫 SiteHead: Prevented Facebook Pixel script from loading');
                  element.remove();
                }
              }
            });
          });
        });
        
        observer.observe(document.head, { childList: true, subtree: true });
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Clean up observer after a short time
        setTimeout(() => observer.disconnect(), 5000);
        
        return;
      }

      // Add Facebook Pixel with improved detection (only if valid pixel ID is configured and not already loaded)
      if (facebookPixelId && /^[0-9]+$/.test(facebookPixelId.trim())) {
        // Check for existing Facebook Pixel script by looking for the correct URL pattern
        const existingFbScript = document.querySelector('script[src*="connect.facebook.net/en_US/fbevents.js"]');
        
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
                console.log('✅ SiteHead: Facebook Pixel initialized successfully for ${facebookPixelId.trim()}');
              } catch (fbError) {
                console.warn('Facebook Pixel initialization failed:', fbError);
              }
            `;
            document.head.appendChild(fbScript);
            console.log('✅ SiteHead: Facebook Pixel script loaded successfully');
          } catch (error) {
            console.warn('Facebook Pixel script creation failed:', error);
          }
        } else {
          console.log('📱 SiteHead: Facebook Pixel script already exists');
          
          // If script already exists, still try to initialize if fbq is available
          setTimeout(() => {
            try {
              const windowWithFbq = window as Window & { fbq?: (...args: unknown[]) => void };
              if (typeof window !== 'undefined' && windowWithFbq.fbq) {
                windowWithFbq.fbq('init', facebookPixelId.trim());
                windowWithFbq.fbq('track', 'PageView');
                console.log('📱 SiteHead: Facebook Pixel re-initialized for existing script');
              }
            } catch (error) {
              console.warn('Facebook Pixel re-initialization failed:', error);
            }
          }, 100);
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
      console.error('SiteHead: Critical error in third-party scripts setup:', error);
    }
  }, [googleTagManagerId, facebookPixelId, customHeaderScripts, customFooterScripts, customCss]);
};
