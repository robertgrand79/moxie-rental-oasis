import { supabase } from '@/integrations/supabase/client';

/**
 * Standalone function to create security alerts without requiring React context
 * Used in AuthContext and other places where hooks can't be used
 */
export const createSecurityNotification = async (params: {
  organizationId: string;
  alertType: 'login_attempt' | 'permission_change' | 'api_key_usage' | 'suspicious_activity';
  title: string;
  message: string;
  details?: Record<string, any>;
}) => {
  const { organizationId, alertType, title, message, details } = params;
  
  try {
    await supabase.from('admin_notifications').insert({
      organization_id: organizationId,
      user_id: null,
      notification_type: 'SECURITY_ALERT',
      category: 'SYSTEM',
      title,
      message,
      action_url: '/admin/settings/security',
      priority: alertType === 'suspicious_activity' ? 'urgent' : 'high',
      metadata: {
        alert_type: alertType,
        ...details,
      },
    });
  } catch (error) {
    console.error('Failed to create security notification:', error);
  }
};

/**
 * Track failed login attempts and create notifications after threshold
 */
export const trackFailedLogin = async (email: string, organizationId?: string) => {
  const key = `failed_login_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const now = Date.now();
  
  // Get existing attempts
  const attemptsJson = localStorage.getItem(key);
  let attempts: number[] = attemptsJson ? JSON.parse(attemptsJson) : [];
  
  // Filter to last hour only
  attempts = attempts.filter(t => now - t < 60 * 60 * 1000);
  attempts.push(now);
  localStorage.setItem(key, JSON.stringify(attempts));
  
  // If 3+ failed attempts in an hour, create security alert
  if (attempts.length >= 3 && organizationId) {
    const lastNotifKey = `login_alert_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const lastNotif = localStorage.getItem(lastNotifKey);
    
    // Only alert once per hour
    if (!lastNotif || now - parseInt(lastNotif) > 60 * 60 * 1000) {
      localStorage.setItem(lastNotifKey, now.toString());
      
      await createSecurityNotification({
        organizationId,
        alertType: 'login_attempt',
        title: 'Multiple Failed Login Attempts',
        message: `${attempts.length} failed login attempts detected for ${email.substring(0, 3)}***@*** in the last hour.`,
        details: {
          email_masked: `${email.substring(0, 3)}***`,
          attempt_count: attempts.length,
          period: 'last_hour',
        },
      });
    }
  }
};

/**
 * Clear failed login tracking on successful login
 */
export const clearFailedLoginTracking = (email: string) => {
  const key = `failed_login_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  localStorage.removeItem(key);
};
