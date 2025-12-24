import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/services/monitoring/structuredLogger';

const redactToken = (token: string): string => {
  if (!token || token.length < 12) return '[REDACTED]';
  return `${token.substring(0, 6)}...${token.substring(token.length - 4)}`;
};
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
      logger.error('Error checking push notification permissions', err instanceof Error ? err : undefined, { component: 'MobilePush' });
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
      logger.error('Error requesting push notification permission', err instanceof Error ? err : undefined, { component: 'MobilePush' });
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
        logger.error('Error saving push notification token', new Error(error.message), { component: 'MobilePush' });
      } else {
        logger.info('Push notification token saved successfully', { component: 'MobilePush', tokenPreview: redactToken(pushToken) });
      }
    } catch (err) {
      logger.error('Exception saving push notification token', err instanceof Error ? err : undefined, { component: 'MobilePush' });
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
      logger.info('Push notification token unregistered', { component: 'MobilePush' });
    } catch (err) {
      logger.error('Error unregistering push notification token', err instanceof Error ? err : undefined, { component: 'MobilePush' });
    }
  }, [token, user]);

  // Set up push notification listeners
  useEffect(() => {
    if (!isSupported) return;

    checkPermission();

    // Registration success
    const registrationListener = PushNotifications.addListener('registration', (tokenData: Token) => {
      logger.info('Push notification registration successful', { component: 'MobilePush', tokenPreview: redactToken(tokenData.value) });
      setToken(tokenData.value);
      saveTokenToDatabase(tokenData.value);
    });

    // Registration error
    const registrationErrorListener = PushNotifications.addListener('registrationError', (error) => {
      logger.error('Push notification registration error', new Error(String(error)), { component: 'MobilePush' });
    });

    // Notification received in foreground
    const notificationReceivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        logger.info('Push notification received', { component: 'MobilePush', title: notification.title, id: notification.id });
      }
    );

    // Notification tapped
    const notificationActionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        logger.info('Push notification action performed', { component: 'MobilePush', actionId: action.actionId });
        
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
