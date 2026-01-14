/**
 * Unified Audit Logger Hook
 * 
 * Combines platform admin audit logging and security audit logging
 * into a single convenient hook for use throughout the application.
 */

import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

type SecurityEventType = 'authentication' | 'authorization' | 'data_access' | 'admin_action' | 'suspicious_activity';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEventParams {
  eventType: SecurityEventType;
  resource?: string;
  action: string;
  details?: Record<string, unknown>;
  riskLevel?: RiskLevel;
}

export const useAuditLogger = () => {
  const { user, profile } = useAuth();
  const { organization, isPlatformAdmin } = useCurrentOrganization();
  const lastLogRef = useRef<{ key: string; time: number } | null>(null);

  /**
   * Prevent duplicate logs within a short time window (debounce)
   */
  const shouldLog = useCallback((key: string): boolean => {
    const now = Date.now();
    if (lastLogRef.current?.key === key && now - lastLogRef.current.time < 2000) {
      return false; // Skip duplicate within 2 seconds
    }
    lastLogRef.current = { key, time: now };
    return true;
  }, []);

  /**
   * Log a security event to the security_audit_logs table
   */
  const logSecurityEvent = useCallback(async (params: SecurityEventParams): Promise<void> => {
    const logKey = `${params.eventType}-${params.action}-${params.resource || ''}`;
    if (!shouldLog(logKey)) return;

    try {
      const { error } = await supabase
        .from('security_audit_logs')
        .insert({
          event_type: params.eventType,
          user_id: user?.id || null,
          user_agent: navigator?.userAgent || null,
          resource: params.resource || null,
          action: params.action,
          details: {
            ...params.details,
            organization_id: organization?.id,
            organization_name: organization?.name,
            user_email: profile?.email || user?.email,
            is_platform_admin: isPlatformAdmin,
          },
          risk_level: params.riskLevel || 'low',
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (err) {
      console.error('Error logging security event:', err);
    }
  }, [user, profile, organization, isPlatformAdmin, shouldLog]);

  /**
   * Log successful authentication
   */
  const logAuthSuccess = useCallback((method: string = 'password') => {
    return logSecurityEvent({
      eventType: 'authentication',
      action: 'login_success',
      details: { method },
      riskLevel: 'low',
    });
  }, [logSecurityEvent]);

  /**
   * Log failed authentication attempt
   */
  const logAuthFailure = useCallback((email: string, reason: string) => {
    return logSecurityEvent({
      eventType: 'authentication',
      action: 'login_failure',
      details: { email, reason },
      riskLevel: 'medium',
    });
  }, [logSecurityEvent]);

  /**
   * Log user logout
   */
  const logLogout = useCallback(() => {
    return logSecurityEvent({
      eventType: 'authentication',
      action: 'logout',
      riskLevel: 'low',
    });
  }, [logSecurityEvent]);

  /**
   * Log signup event
   */
  const logSignup = useCallback((email: string) => {
    return logSecurityEvent({
      eventType: 'authentication',
      action: 'signup',
      details: { email },
      riskLevel: 'low',
    });
  }, [logSecurityEvent]);

  /**
   * Log password reset request
   */
  const logPasswordResetRequest = useCallback((email: string) => {
    return logSecurityEvent({
      eventType: 'authentication',
      action: 'password_reset_request',
      details: { email },
      riskLevel: 'low',
    });
  }, [logSecurityEvent]);

  /**
   * Log data access event
   */
  const logDataAccess = useCallback((resource: string, action: string, details?: Record<string, unknown>) => {
    return logSecurityEvent({
      eventType: 'data_access',
      resource,
      action,
      details,
      riskLevel: 'low',
    });
  }, [logSecurityEvent]);

  /**
   * Log admin action
   */
  const logAdminAction = useCallback((action: string, resource?: string, details?: Record<string, unknown>) => {
    return logSecurityEvent({
      eventType: 'admin_action',
      resource,
      action,
      details,
      riskLevel: 'medium',
    });
  }, [logSecurityEvent]);

  /**
   * Log suspicious activity
   */
  const logSuspiciousActivity = useCallback((description: string, details?: Record<string, unknown>) => {
    return logSecurityEvent({
      eventType: 'suspicious_activity',
      action: description,
      details,
      riskLevel: 'high',
    });
  }, [logSecurityEvent]);

  /**
   * Log authorization failure (access denied)
   */
  const logAuthorizationFailure = useCallback((resource: string, action: string) => {
    return logSecurityEvent({
      eventType: 'authorization',
      resource,
      action: `access_denied_${action}`,
      riskLevel: 'medium',
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logAuthSuccess,
    logAuthFailure,
    logLogout,
    logSignup,
    logPasswordResetRequest,
    logDataAccess,
    logAdminAction,
    logSuspiciousActivity,
    logAuthorizationFailure,
  };
};
