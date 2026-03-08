import React, { useState } from 'react';
import { X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const DISMISS_KEY = 'pwa-ios-prompt-dismissed';

const IOSInstallPrompt = () => {
  const { isIOS, isStandalone } = usePWAInstall();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true'
  );

  if (!isIOS || isStandalone || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="mx-3 mb-3 rounded-xl border border-border bg-card p-4 shadow-lg flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-card-foreground">
            Install Stay Moxie
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tap the{' '}
            <Share className="inline h-3.5 w-3.5 -mt-0.5 text-primary" />{' '}
            share button below and select{' '}
            <span className="font-medium text-card-foreground">"Add to Home Screen"</span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default IOSInstallPrompt;
