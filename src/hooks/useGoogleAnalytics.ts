
import { useEffect } from 'react';

export const useGoogleAnalytics = (googleAnalyticsId: string) => {
  useEffect(() => {
    if (!googleAnalyticsId || !/^G-[A-Z0-9]+$/.test(googleAnalyticsId)) {
      if (googleAnalyticsId) {
        console.warn('⚠️ SiteHead: Invalid Google Analytics ID format:', googleAnalyticsId);
      }
      return;
    }

    // Check for existing Google Analytics script by looking for the correct URL pattern
    const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    
    if (!existingScript) {
      console.log('📊 SiteHead: Loading Google Analytics script for:', googleAnalyticsId);
      
      // Create and load the GA script
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      gaScript.setAttribute('data-ga-id', googleAnalyticsId);
      
      gaScript.onload = () => {
        console.log('✅ SiteHead: Google Analytics script loaded successfully');
        
        // Dispatch event immediately after script loads
        const event = new CustomEvent('ga-script-loaded', { 
          detail: { 
            gaId: googleAnalyticsId,
            timestamp: Date.now()
          } 
        });
        window.dispatchEvent(event);
        console.log('📊 SiteHead: ga-script-loaded event dispatched for', googleAnalyticsId);
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
      console.log('📊 SiteHead: Google Analytics script already exists');
      
      // If script already exists, still dispatch event
      setTimeout(() => {
        const event = new CustomEvent('ga-script-loaded', { 
          detail: { 
            gaId: googleAnalyticsId,
            timestamp: Date.now(),
            existingScript: true
          } 
        });
        window.dispatchEvent(event);
        console.log('📊 SiteHead: ga-script-loaded event dispatched for existing script');
      }, 100);
    }
  }, [googleAnalyticsId]);
};
