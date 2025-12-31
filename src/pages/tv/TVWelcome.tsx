import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Tv, Loader2, RefreshCw } from 'lucide-react';
import TVLayout, { tvStyles } from '@/components/tv/TVLayout';
import TVHeader from '@/components/tv/TVHeader';
import TVFocusableButton from '@/components/tv/TVFocusableButton';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PropertyInfo {
  id: string;
  name: string;
  organization_id: string;
}

interface DeviceInfo {
  id: string;
  pairing_code: string;
  is_paired: boolean;
  display_mode: string;
}

/**
 * TVWelcome - Unpaired TV welcome screen
 * 
 * Shows:
 * - Property branding
 * - QR code for guest pairing
 * - 6-digit pairing code
 * - Polls for pairing status
 */
const TVWelcome: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get or create device ID from localStorage
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('tv_device_id');
    if (!deviceId) {
      deviceId = `tv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('tv_device_id', deviceId);
    }
    return deviceId;
  };

  useEffect(() => {
    if (propertyId) {
      fetchPropertyAndDevice();
    }
  }, [propertyId]);

  // Poll for pairing status
  useEffect(() => {
    if (!device || device.is_paired) return;

    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('tv_device_pairings')
        .select('is_paired, display_mode')
        .eq('id', device.id)
        .single();

      if (data?.is_paired) {
        // Navigate to portal when paired
        navigate(`/tv/${propertyId}/portal`);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [device, propertyId, navigate]);

  const fetchPropertyAndDevice = async () => {
    if (!propertyId) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch property info
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('id, title, organization_id')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;
      setProperty({ id: propertyData.id, name: propertyData.title, organization_id: propertyData.organization_id });

      // Get or create device
      const deviceId = getDeviceId();
      
      // Check if device already exists
      const { data: existingDevice } = await supabase
        .from('tv_device_pairings')
        .select('id, pairing_code, is_paired, display_mode')
        .eq('device_id', deviceId)
        .eq('property_id', propertyId)
        .single();

      if (existingDevice) {
        setDevice(existingDevice as DeviceInfo);
        if (existingDevice.is_paired) {
          navigate(`/tv/${propertyId}/portal`);
        }
      } else {
        // Register new device
        const pairingCode = Math.random().toString().slice(2, 8);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

        const { data: newDevice, error: createError } = await supabase
          .from('tv_device_pairings')
          .insert({
            organization_id: propertyData.organization_id,
            property_id: propertyId,
            device_id: deviceId,
            device_name: 'TV Device',
            pairing_code: pairingCode,
            pairing_code_expires_at: expiresAt,
            display_mode: 'welcome'
          })
          .select('id, pairing_code, is_paired, display_mode')
          .single();

        if (createError) throw createError;
        setDevice(newDevice as DeviceInfo);
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateCode = async () => {
    if (!device) return;
    
    const pairingCode = Math.random().toString().slice(2, 8);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('tv_device_pairings')
      .update({
        pairing_code: pairingCode,
        pairing_code_expires_at: expiresAt
      })
      .eq('id', device.id);

    if (!error) {
      setDevice({ ...device, pairing_code: pairingCode });
    }
  };

  // Generate QR code URL (using a simple QR service)
  const qrCodeUrl = device?.pairing_code 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `${window.location.origin}/pair-tv?code=${device.pairing_code}&property=${propertyId}`
      )}`
    : null;

  if (isLoading) {
    return (
      <TVLayout className="flex items-center justify-center">
        <div className="text-center">
          <Loader2 className={cn(tvStyles.iconLarge, "animate-spin mx-auto text-primary")} />
          <p className={cn(tvStyles.body, "mt-6 text-muted-foreground")}>
            Loading...
          </p>
        </div>
      </TVLayout>
    );
  }

  if (error) {
    return (
      <TVLayout className="flex items-center justify-center">
        <div className="text-center">
          <Tv className={cn(tvStyles.iconLarge, "mx-auto text-destructive")} />
          <p className={cn(tvStyles.heading3, "mt-6")}>
            Unable to Connect
          </p>
          <p className={cn(tvStyles.body, "mt-2 text-muted-foreground")}>
            {error}
          </p>
          <TVFocusableButton 
            className="mt-8"
            onClick={() => fetchPropertyAndDevice()}
          >
            <RefreshCw className="h-6 w-6 mr-3" />
            Try Again
          </TVFocusableButton>
        </div>
      </TVLayout>
    );
  }

  return (
    <TVLayout>
      <div className="h-full flex flex-col">
        <TVHeader propertyName={property?.name} />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-3xl mx-auto">
            {/* Welcome Message */}
            <h1 className={cn(tvStyles.heading1, "mb-4")}>
              Welcome
            </h1>
            <p className={cn(tvStyles.heading3, "text-muted-foreground mb-12")}>
              Scan the QR code or enter the code below to connect
            </p>

            <div className="flex items-center justify-center gap-16">
              {/* QR Code */}
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="Pairing QR Code"
                    className="w-64 h-64"
                  />
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
                  {device?.pairing_code || '------'}
                </p>
                <p className={cn(tvStyles.caption, "mt-4")}>
                  Visit <span className="text-primary font-medium">
                    {window.location.host}/pair-tv
                  </span>
                </p>
              </div>
            </div>

            {/* Refresh Code Button */}
            <TVFocusableButton 
              variant="outline"
              className="mt-12"
              onClick={regenerateCode}
            >
              <RefreshCw className="h-6 w-6 mr-3" />
              Get New Code
            </TVFocusableButton>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center">
          <p className={cn(tvStyles.caption)}>
            Powered by Guidio TV
          </p>
        </footer>
      </div>
    </TVLayout>
  );
};

export default TVWelcome;
