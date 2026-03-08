import React, { useState } from 'react';
import { X, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const DISMISS_KEY = 'pwa-install-banner-dismissed';

const InstallBanner = () => {
  const { canInstall, isIOS, isStandalone, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true'
  );

  // Don't show if already installed, already dismissed, or neither install path available
  if (isStandalone || dismissed || (!canInstall && !isIOS)) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      handleDismiss();
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-primary text-primary-foreground">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <Download className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium truncate">
            {isIOS ? (
              <>
                Install Stay Moxie — tap{' '}
                <Share className="inline h-3.5 w-3.5 -mt-0.5" />{' '}
                then "Add to Home Screen"
              </>
            ) : (
              'Install Stay Moxie for a faster, native app experience'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canInstall && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs font-semibold"
              onClick={handleInstall}
            >
              Install
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
