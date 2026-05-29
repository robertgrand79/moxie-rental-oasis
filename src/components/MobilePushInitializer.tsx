import React, { useEffect } from 'react';
import { useMobilePushNotifications } from '@/hooks/useMobilePushNotifications';
import { useAuth } from '@/contexts/AuthContext';

export const MobilePushInitializer: React.FC = () => {
  const { isSupported, permissionStatus, requestPermission, registerToken } = useMobilePushNotifications();
  const { user } = useAuth();

  useEffect(() => {
    const initPush = async () => {
      if (isSupported && user) {
        if (permissionStatus === 'prompt') {
          await requestPermission();
        } else if (permissionStatus === 'granted') {
          await registerToken();
        }
      }
    };
    initPush();
  }, [isSupported, user, permissionStatus, requestPermission, registerToken]);

  return null;
};
