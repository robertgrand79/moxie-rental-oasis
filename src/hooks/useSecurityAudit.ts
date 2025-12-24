import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSystemNotifications } from '@/hooks/useSystemNotifications';

interface SecurityAuditEvent {
  event_type: 'authentication' | 'authorization' | 'data_access' | 'admin_action' | 'suspicious_activity';
  resource?: string;
  action?: string;
  details?: Record<string, any>;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
}

export const useSecurityAudit = () => {
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();
  const { createSecurityAlert } = useSystemNotifications();

  const logSecurityEvent = useCallback(async (event: SecurityAuditEvent) => {
    try {
      // Get client-side info
      const userAgent = navigator?.userAgent;
      
      await supabase.from('security_audit_logs').insert({
        event_type: event.event_type,
        user_id: user?.id,
        user_agent: userAgent,
        resource: event.resource,
        action: event.action,
        details: event.details || {},
        risk_level: event.risk_level || 'low'
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user?.id]);

  const logAuthEvent = useCallback((action: string, success: boolean, details?: Record<string, any>) => {
    logSecurityEvent({
      event_type: 'authentication',
      action,
      details: { success, ...details },
      risk_level: success ? 'low' : 'medium'
    });
  }, [logSecurityEvent]);

  const logDataAccess = useCallback((resource: string, action: string, details?: Record<string, any>) => {
    logSecurityEvent({
      event_type: 'data_access',
      resource,
      action,
      details,
      risk_level: 'low'
    });
  }, [logSecurityEvent]);

  const logAdminAction = useCallback((action: string, resource?: string, details?: Record<string, any>) => {
    logSecurityEvent({
      event_type: 'admin_action',
      resource,
      action,
      details,
      risk_level: 'medium'
    });
  }, [logSecurityEvent]);

  const logSuspiciousActivity = useCallback((description: string, details?: Record<string, any>) => {
    logSecurityEvent({
      event_type: 'suspicious_activity',
      action: description,
      details,
      risk_level: 'high'
    });
    
    // Also create a system notification for suspicious activity
    if (organization?.id) {
      createSecurityAlert({
        alertType: 'suspicious_activity',
        title: 'Suspicious Activity Detected',
        message: description,
        details,
      });
    }
  }, [logSecurityEvent, organization?.id, createSecurityAlert]);

  return {
    logSecurityEvent,
    logAuthEvent,
    logDataAccess,
    logAdminAction,
    logSuspiciousActivity
  };
};