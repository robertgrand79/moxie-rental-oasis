
import { useEffect } from 'react';

export const useGoogleAnalytics = (googleAnalyticsId: string) => {
  useEffect(() => {
    if (!googleAnalyticsId || !/^G-[A-Z0-9]+$/.test(googleAnalyticsId)) {
      if (googleAnalyticsId) {
        console.warn('⚠️ SiteHead: Invalid Google Analytics ID format:', googleAnalyticsId);
      }
      return;
    }

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
  }, [googleAnalyticsId]);
};
