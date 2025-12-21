import React, { useEffect, useRef, useCallback } from 'react';

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'invisible';
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact' | 'invisible';
        'refresh-expired'?: 'auto' | 'manual' | 'never';
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        'error-callback': onError,
        'expired-callback': onExpire,
        theme,
        size,
        'refresh-expired': 'auto',
      });
    } catch (error) {
      console.error('Failed to render Turnstile widget:', error);
      onError?.();
    }
  }, [siteKey, onVerify, onError, onExpire, theme, size]);

  useEffect(() => {
    // Check if script already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="turnstile"]');
    if (existingScript && !scriptLoadedRef.current) {
      window.onTurnstileLoad = renderWidget;
      return;
    }

    // Load the Turnstile script
    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
      script.async = true;
      script.defer = true;

      window.onTurnstileLoad = renderWidget;

      document.head.appendChild(script);
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Widget may already be removed
        }
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  return (
    <div 
      ref={containerRef} 
      className={`cf-turnstile ${className}`}
      data-sitekey={siteKey}
    />
  );
};

export default TurnstileWidget;
