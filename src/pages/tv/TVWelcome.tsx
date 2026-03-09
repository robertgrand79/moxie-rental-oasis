import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Tv, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import TVLayout, { tvStyles } from '@/components/tv/TVLayout';
import TVHeader from '@/components/tv/TVHeader';
import TVFocusableButton from '@/components/tv/TVFocusableButton';
import { useTVDevice } from '@/hooks/useTVDevice';
import { cn } from '@/lib/utils';

const TVWelcome: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();

  const {
    device,
    isLoading,
    error,
    isPaired,
    displayMode,
    pairingCode,
    isPairingCodeExpired,
    getQRCodeUrl,
    registerDevice,
    regeneratePairingCode,
    refetch,
  } = useTVDevice(propertyId);

  // React to display_mode changes
  useEffect(() => {
    if (!isPaired) return;
    if (displayMode === 'signage') {
      navigate(`/tv/${propertyId}/signage`);
    } else if (displayMode === 'guest_portal') {
      navigate(`/tv/${propertyId}/portal`);
    }
    // 'welcome' stays on this page
  }, [isPaired, displayMode, propertyId, navigate]);

  // Register device if not exists
  useEffect(() => {
    if (!isLoading && !device && propertyId && !registerDevice.isPending) {
      registerDevice.mutate({ property_id: propertyId });
    }
  }, [isLoading, device, propertyId, registerDevice]);

  const qrCodeUrl = getQRCodeUrl(window.location.origin);

  // Determine if we have a guest name from the heartbeat data
  const guestName = (device as any)?.guest_name || null;
  const hasActiveReservation = isPaired && guestName;

  if (isLoading || registerDevice.isPending) {
    return (
      <TVLayout className="flex items-center justify-center">
        <div className="text-center">
          <Loader2 className={cn(tvStyles.iconLarge, "animate-spin mx-auto text-primary")} />
          <p className={cn(tvStyles.body, "mt-6 text-muted-foreground")}>
            {registerDevice.isPending ? 'Registering device...' : 'Loading...'}
          </p>
        </div>
      </TVLayout>
    );
  }

  if (error || registerDevice.error) {
    const errorMessage = (error as Error)?.message || registerDevice.error?.message || 'Failed to load';
    return (
      <TVLayout className="flex items-center justify-center">
        <div className="text-center">
          <Tv className={cn(tvStyles.iconLarge, "mx-auto text-destructive")} />
          <p className={cn(tvStyles.heading3, "mt-6")}>Unable to Connect</p>
          <p className={cn(tvStyles.body, "mt-2 text-muted-foreground")}>{errorMessage}</p>
          <TVFocusableButton className="mt-8" onClick={() => refetch()}>
            <RefreshCw className="h-6 w-6 mr-3" />
            Try Again
          </TVFocusableButton>
        </div>
      </TVLayout>
    );
  }

  // Paired with active reservation — show personalized welcome
  if (hasActiveReservation) {
    return (
      <TVLayout>
        <div className="h-full flex flex-col items-center justify-center text-center">
          <TVHeader propertyName={device?.property?.title} />
          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-8">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
              Welcome, {guestName}!
            </h1>
            <p className={cn(tvStyles.heading3, "text-muted-foreground mb-4")}>
              to {device?.property?.title}
            </p>
            <p className={cn(tvStyles.body, "text-muted-foreground mb-12 max-w-xl")}>
              We're delighted to have you. Explore local recommendations, house info, and more through the guest portal.
            </p>
            <TVFocusableButton
              className="text-xl px-12 py-6"
              onClick={() => navigate(`/tv/${propertyId}/portal`)}
            >
              Enter Guest Portal
              <ArrowRight className="h-6 w-6 ml-3" />
            </TVFocusableButton>
          </div>
          <footer className="py-6 text-center">
            <p className={tvStyles.caption}>Powered by Guidio TV</p>
          </footer>
        </div>
      </TVLayout>
    );
  }

  // Not paired — show QR/pairing code
  return (
    <TVLayout>
      <div className="h-full flex flex-col">
        <TVHeader propertyName={device?.property?.title} />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className={cn(tvStyles.heading1, "mb-4")}>Welcome</h1>
            <p className={cn(tvStyles.heading3, "text-muted-foreground mb-12")}>
              Scan the QR code or enter the code below to connect
            </p>

            <div className="flex items-center justify-center gap-16">
              {/* QR Code */}
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Pairing QR Code" className="w-64 h-64" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Pairing Code */}
              <div className="text-left">
                <p className={cn(tvStyles.bodySmall, "text-muted-foreground mb-2")}>
                  Or enter this code:
                </p>
                <p className="text-7xl font-mono font-bold tracking-[0.3em] text-primary">
                  {pairingCode || '------'}
                </p>
                {isPairingCodeExpired() && pairingCode && (
                  <p className={cn(tvStyles.caption, "mt-2 text-destructive")}>
                    Code expired - click refresh below
                  </p>
                )}
                <p className={cn(tvStyles.caption, "mt-4")}>
                  Visit <span className="text-primary font-medium">{window.location.host}/pair-tv</span>
                </p>
              </div>
            </div>

            <TVFocusableButton
              variant="outline"
              className="mt-12"
              onClick={() => regeneratePairingCode.mutate()}
              disabled={regeneratePairingCode.isPending}
            >
              {regeneratePairingCode.isPending ? (
                <Loader2 className="h-6 w-6 mr-3 animate-spin" />
              ) : (
                <RefreshCw className="h-6 w-6 mr-3" />
              )}
              Get New Code
            </TVFocusableButton>
          </div>
        </div>

        <footer className="py-6 text-center">
          <p className={tvStyles.caption}>Powered by Guidio TV</p>
        </footer>
      </div>
    </TVLayout>
  );
};

export default TVWelcome;
