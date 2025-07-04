import { useEffect, useRef } from 'react';

interface LazyGoogleAnalyticsOptions {
  enabled: boolean;
  googleAnalyticsId: string;
  onScriptLoad?: () => void;
  onScriptError?: (error: Error) => void;
}

export const useLazyGoogleAnalytics = ({
  enabled,
  googleAnalyticsId,
  onScriptLoad,
  onScriptError
}: LazyGoogleAnalyticsOptions) => {
  const scriptLoadedRef = useRef(false);
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (!enabled || !googleAnalyticsId || !/^G-[A-Z0-9]+$/.test(googleAnalyticsId)) {
      return;
    }

    // Check if script already exists to avoid duplicates
    const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${googleAnalyticsId}"]`);
    
    if (existingScript && scriptLoadedRef.current) {
      console.log('📊 LazyGA: Script already loaded, dispatching event');
      setTimeout(() => {
        const event = new CustomEvent('ga-script-loaded', { 
          detail: { 
            gaId: googleAnalyticsId,
            timestamp: Date.now(),
            lazy: true
          } 
        });
        window.dispatchEvent(event);
        onScriptLoad?.();
      }, 100);
      return;
    }

    if (!existingScript) {
      console.log('📊 LazyGA: Loading Google Analytics script lazily for:', googleAnalyticsId);
      
      // Create and load the GA script
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      gaScript.setAttribute('data-ga-id', googleAnalyticsId);
      gaScript.setAttribute('data-lazy-loaded', 'true');
      
      gaScript.onload = () => {
        console.log('✅ LazyGA: Script loaded successfully');
        scriptLoadedRef.current = true;
        
        // Dispatch event
        const event = new CustomEvent('ga-script-loaded', { 
          detail: { 
            gaId: googleAnalyticsId,
            timestamp: Date.now(),
            lazy: true
          } 
        });
        window.dispatchEvent(event);
        onScriptLoad?.();
      };
      
      gaScript.onerror = (error) => {
        console.error('❌ LazyGA: Error loading script:', error);
        const errorObj = new Error('Failed to load Google Analytics script');
        onScriptError?.(errorObj);
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
          console.log('📊 LazyGA: Google Analytics configured successfully');
        } catch (error) {
          console.error('❌ LazyGA: Error configuring Google Analytics:', error);
        }
      `;
      gaConfigScript.setAttribute('data-lazy-loaded', 'true');
      document.head.appendChild(gaConfigScript);

      // Track cleanup functions
      cleanupFunctionsRef.current.push(() => {
        if (gaScript.parentNode) {
          gaScript.parentNode.removeChild(gaScript);
        }
        if (gaConfigScript.parentNode) {
          gaConfigScript.parentNode.removeChild(gaConfigScript);
        }
      });
    }

    // Cleanup function
    return () => {
      // Note: We don't automatically clean up scripts when component unmounts
      // as they might be needed by other parts of the app
      // Cleanup is handled manually via cleanupGAResources
    };
  }, [enabled, googleAnalyticsId, onScriptLoad, onScriptError]);

  // Manual cleanup function for when user navigates away
  const cleanupGAResources = () => {
    console.log('🧹 LazyGA: Cleaning up GA resources');
    
    // Remove lazy-loaded scripts
    const lazyScripts = document.querySelectorAll('script[data-lazy-loaded="true"]');
    lazyScripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });

    // Clear dataLayer if it was created by lazy loading
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      // Don't completely remove dataLayer as it might be used by other scripts
      // Just mark that our lazy loading session is ended
      try {
        (window as any).gtag?.('config', googleAnalyticsId, { send_page_view: false });
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    // Run manual cleanup functions
    cleanupFunctionsRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('⚠️ LazyGA: Error during cleanup:', error);
      }
    });
    cleanupFunctionsRef.current = [];
    
    scriptLoadedRef.current = false;
  };

  return {
    cleanupGAResources,
    isScriptLoaded: scriptLoadedRef.current
  };
};