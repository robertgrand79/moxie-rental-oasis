import { useEffect } from 'react';
import { debug } from '@/utils/debug';

export const useGoogleAnalytics = (googleAnalyticsId: string) => {
  useEffect(() => {
    if (!googleAnalyticsId || !/^G-[A-Z0-9]+$/.test(googleAnalyticsId)) {
      if (googleAnalyticsId) {
        debug.warn('[Analytics] Invalid Google Analytics ID format:', googleAnalyticsId);
      }
      return;
    }

    // Check for existing Google Analytics script by looking for the correct URL pattern
    const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    
    if (!existingScript) {
      debug.analytics('Loading Google Analytics script for:', googleAnalyticsId);
      
      // Create and load the GA script
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      gaScript.setAttribute('data-ga-id', googleAnalyticsId);
      
      gaScript.onload = () => {
        debug.analytics('Google Analytics script loaded successfully');
        
        // Dispatch event immediately after script loads
        const event = new CustomEvent('ga-script-loaded', { 
          detail: { 
            gaId: googleAnalyticsId,
            timestamp: Date.now()
          } 
        });
        window.dispatchEvent(event);
        debug.analytics('ga-script-loaded event dispatched');
      };
      
      gaScript.onerror = (error) => {
        debug.error('[Analytics] Error loading Google Analytics script:', error);
      };
      
      document.head.appendChild(gaScript);

      // Create the GA configuration script - note: inline console.log kept for GA debug
      const gaConfigScript = document.createElement('script');
      gaConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googleAnalyticsId}', {
          send_page_view: true,
          debug_mode: false
        });
      `;
      document.head.appendChild(gaConfigScript);
      
    } else {
      debug.analytics('Google Analytics script already exists');
      
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
      }, 100);
    }
  }, [googleAnalyticsId]);
};
