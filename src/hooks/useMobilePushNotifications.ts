import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useNavigate } from 'react-router-dom';

interface UseMobilePushReturn {
  isNative: boolean;
  isSupported: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  token: string | null;
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<void>;
  unregisterToken: () => Promise<void>;
}

export function useMobilePushNotifications(): UseMobilePushReturn {
  const { user } = useAuth();
  const { organization: currentOrganization } = useCurrentOrganization();
  const navigate = useNavigate();
  
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [token, setToken] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();
  const isSupported = isNative && Capacitor.isPluginAvailable('PushNotifications');

  const checkPermission = useCallback(async () => {
    if (!isSupported) return;

    try {
      const result = await PushNotifications.checkPermissions();
      setPermissionStatus(result.receive as 'granted' | 'denied' | 'prompt');
    } catch (err) {
      console.error('[MobilePush] Error checking permissions:', err);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await PushNotifications.requestPermissions();
      setPermissionStatus(result.receive as 'granted' | 'denied' | 'prompt');
      
      if (result.receive === 'granted') {
        await PushNotifications.register();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[MobilePush] Error requesting permission:', err);
      return false;
    }
  }, [isSupported]);

  const saveTokenToDatabase = useCallback(async (pushToken: string) => {
    if (!user) return;

    try {
      const platform = Capacitor.getPlatform() as 'ios' | 'android';
      
      // Upsert the token
      const { error } = await supabase
        .from('push_notification_tokens')
        .upsert({
          user_id: user.id,
          organization_id: currentOrganization?.id || null,
          token: pushToken,
          platform,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'token',
        });

      if (error) {
        console.error('[MobilePush] Error saving token:', error);
      } else {
        console.log('[MobilePush] Token saved successfully');
      }
    } catch (err) {
      console.error('[MobilePush] Exception saving token:', err);
    }
  }, [user, currentOrganization]);

  const registerToken = useCallback(async () => {
    if (!isSupported || !user) return;

    if (permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    await PushNotifications.register();
  }, [isSupported, user, permissionStatus, requestPermission]);

  const unregisterToken = useCallback(async () => {
    if (!token || !user) return;

    try {
      // Deactivate the token in database
      await supabase
        .from('push_notification_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('token', token);

      setToken(null);
      console.log('[MobilePush] Token unregistered');
    } catch (err) {
      console.error('[MobilePush] Error unregistering token:', err);
    }
  }, [token, user]);

  // Set up push notification listeners
  useEffect(() => {
    if (!isSupported) return;

    checkPermission();

    // Registration success
    const registrationListener = PushNotifications.addListener('registration', (tokenData: Token) => {
      console.log('[MobilePush] Registration successful, token:', tokenData.value);
      setToken(tokenData.value);
      saveTokenToDatabase(tokenData.value);
    });

    // Registration error
    const registrationErrorListener = PushNotifications.addListener('registrationError', (error) => {
      console.error('[MobilePush] Registration error:', error);
    });

    // Notification received in foreground
    const notificationReceivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('[MobilePush] Notification received:', notification);
        // Could show a local notification or toast here
      }
    );

    // Notification tapped
    const notificationActionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('[MobilePush] Notification action:', action);
        
        // Handle deep linking
        const data = action.notification.data;
        if (data?.action_url) {
          navigate(data.action_url);
        }
      }
    );

    return () => {
      registrationListener.then(l => l.remove());
      registrationErrorListener.then(l => l.remove());
      notificationReceivedListener.then(l => l.remove());
      notificationActionListener.then(l => l.remove());
    };
  }, [isSupported, checkPermission, saveTokenToDatabase, navigate]);

  // Auto-register when user logs in
  useEffect(() => {
    if (isSupported && user && permissionStatus === 'granted') {
      registerToken();
    }
  }, [isSupported, user, permissionStatus, registerToken]);

  return {
    isNative,
    isSupported,
    permissionStatus,
    token,
    requestPermission,
    registerToken,
    unregisterToken,
  };
}
