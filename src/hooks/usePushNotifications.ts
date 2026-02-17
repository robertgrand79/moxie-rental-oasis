import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useToast } from './use-toast';
import { debug } from '@/utils/debug';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | 'unsupported';
}

/**
 * Hook for managing browser push notifications
 * Handles service worker registration, subscription management, and permission requests
 * 
 * Note: Full VAPID-based push notifications require server-side setup.
 * Without a configured VAPID key, this hook falls back to in-browser notifications
 * which work when the app is open.
 */
export const usePushNotifications = () => {
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();
  const { toast } = useToast();
  
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: 'unsupported',
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    
    return isSupported;
  }, []);

  // Get current permission status
  const getPermission = useCallback((): NotificationPermission | 'unsupported' => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }, []);

  // Check current subscription status
  const checkSubscription = useCallback(async (): Promise<boolean> => {
    if (!checkSupport()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager?.getSubscription();
      return !!subscription;
    } catch (error) {
      debug.error('[Push] Error checking subscription:', error);
      return false;
    }
  }, [checkSupport]);

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      debug.warn('[Push] Service workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw-push.js', {
        scope: '/',
      });
      debug.push('Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      debug.error('[Push] Service Worker registration failed:', error);
      return null;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        return true;
      } else if (permission === 'denied') {
        toast({
          title: 'Permission Denied',
          description: 'Push notifications are blocked. Enable them in browser settings.',
          variant: 'destructive',
        });
      }
      return false;
    } catch (error) {
      debug.error('[Push] Error requesting permission:', error);
      return false;
    }
  }, [toast]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !organization?.id) {
      toast({
        title: 'Error',
        description: 'Please sign in to enable push notifications.',
        variant: 'destructive',
      });
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await (registration as any).pushManager?.getSubscription();
      
      if (!subscription) {
        // VAPID key would be configured via environment variable in production
        // For now, we gracefully fall back to in-browser notifications
        try {
          subscription = await (registration as any).pushManager?.subscribe({
            userVisibleOnly: true,
            // applicationServerKey would go here with real VAPID key from server
          });
        } catch (subscribeError: any) {
          debug.push('Push subscription unavailable, using in-browser notifications');
          
          // This is expected without proper VAPID key setup
          // Enable local notifications as fallback
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            isSubscribed: true, // Mark as subscribed for UI purposes
          }));
          
          toast({
            title: 'Notifications Enabled',
            description: 'You will receive in-browser notifications when the app is open.',
          });
          
          return true;
        }
      }

      // Store subscription info in localStorage for now
      // In production, you'd store this in the database with a proper push_subscriptions table
      if (subscription) {
        const subscriptionData = subscription.toJSON();
        localStorage.setItem('push_subscription', JSON.stringify({
          endpoint: subscriptionData.endpoint,
          keys: subscriptionData.keys,
          userId: user.id,
          organizationId: organization.id,
        }));
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isSubscribed: true,
        permission: 'granted',
      }));

      toast({
        title: 'Push Notifications Enabled',
        description: 'You will now receive notifications even when the browser is closed.',
      });

      return true;
    } catch (error) {
      debug.error('[Push] Error subscribing:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Error',
        description: 'Failed to enable push notifications. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, organization?.id, requestPermission, registerServiceWorker, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager?.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Remove from localStorage
        localStorage.removeItem('push_subscription');
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isSubscribed: false,
      }));

      toast({
        title: 'Push Notifications Disabled',
        description: 'You will no longer receive push notifications.',
      });

      return true;
    } catch (error) {
      debug.error('[Push] Error unsubscribing:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: 'Error',
        description: 'Failed to disable push notifications.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, toast]);

  // Show a local notification (for testing or when push isn't available)
  const showLocalNotification = useCallback(async (options: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    data?: Record<string, any>;
  }) => {
    if (Notification.permission !== 'granted') {
      debug.warn('[Push] Notification permission not granted');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag || 'local-notification',
        data: options.data,
      });
    } catch (error) {
      debug.error('[Push] Error showing local notification:', error);
      // Fallback to regular Notification API
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
      });
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const isSupported = checkSupport();
      const permission = getPermission();
      const isSubscribed = await checkSubscription();

      setState({
        isSupported,
        isSubscribed,
        isLoading: false,
        permission,
      });
    };

    init();
  }, [checkSupport, getPermission, checkSubscription]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
    showLocalNotification,
  };
};
