import { useEffect } from 'react';

export const useThirdPartyScripts = (
  googleTagManagerId: string,
  facebookPixelId: string,
  customHeaderScripts: string,
  customFooterScripts: string,
  customCss: string
) => {
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

      // Handle Facebook Pixel - remove if disabled
      if (!facebookPixelId || facebookPixelId.trim() === '') {
        console.log('📱 SiteHead: Facebook Pixel disabled, cleaning up existing scripts');
        
        // Remove existing Facebook Pixel scripts
        const existingFbScript = document.querySelector('script[data-fb-pixel]');
        if (existingFbScript) {
          existingFbScript.remove();
          console.log('🗑️ SiteHead: Removed existing Facebook Pixel script');
        }
        
        // Remove Facebook Pixel from window object if it exists
        if (typeof window !== 'undefined' && (window as any).fbq) {
          delete (window as any).fbq;
          console.log('🗑️ SiteHead: Cleaned up Facebook Pixel from window object');
        }
        
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
              if (typeof window !== 'undefined' && (window as any).fbq) {
                (window as any).fbq('init', facebookPixelId.trim());
                (window as any).fbq('track', 'PageView');
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
