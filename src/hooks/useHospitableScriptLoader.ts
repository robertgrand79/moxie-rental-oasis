import { useEffect, useRef } from 'react';

interface HospitableScriptLoaderOptions {
  enabled?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const useHospitableScriptLoader = (options: HospitableScriptLoaderOptions = {}) => {
  const { enabled = true, onLoad, onError } = options;
  const scriptLoadedRef = useRef(false);
  const scriptElementRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!enabled || scriptLoadedRef.current) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="hospitable.com"]');
    if (existingScript) {
      scriptLoadedRef.current = true;
      onLoad?.();
      return;
    }

    // Create and load new script
    const script = document.createElement('script');
    script.src = 'https://widget.hospitable.com/js/booking-widget.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    // Add security attributes
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-no-optimize', '1');

    const handleLoad = () => {
      scriptLoadedRef.current = true;
      onLoad?.();
    };

    const handleError = () => {
      const error = new Error('Failed to load Hospitable script');
      console.error('Hospitable script load failed');
      onError?.(error);
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    // Store reference and append to head
    scriptElementRef.current = script;
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (scriptElementRef.current) {
        scriptElementRef.current.removeEventListener('load', handleLoad);
        scriptElementRef.current.removeEventListener('error', handleError);
        
        // Only remove if we created it
        if (scriptElementRef.current.parentNode) {
          scriptElementRef.current.parentNode.removeChild(scriptElementRef.current);
        }
        scriptElementRef.current = null;
      }
      scriptLoadedRef.current = false;
    };
  }, [enabled, onLoad, onError]);

  return {
    isLoaded: scriptLoadedRef.current,
    scriptElement: scriptElementRef.current
  };
};