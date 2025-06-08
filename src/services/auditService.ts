
import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  success?: boolean;
  details?: Record<string, any>;
}

export const auditService = {
  async logSecurityEvent(entry: AuditLogEntry): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert into security_audit_log table
      const { error } = await supabase
        .from('security_audit_log')
        .insert({
          user_id: user?.id,
          action: entry.action,
          resource_type: entry.resource_type,
          resource_id: entry.resource_id,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent || navigator.userAgent,
          success: entry.success ?? true,
          details: entry.details
        });

      if (error) {
        console.error('Failed to log audit event to database:', error);
        // Fallback to console logging
        console.log('Security Audit Event (Fallback):', {
          timestamp: new Date().toISOString(),
          action: entry.action,
          resource_type: entry.resource_type,
          resource_id: entry.resource_id,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent || navigator.userAgent,
          success: entry.success ?? true,
          details: entry.details
        });
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  },

  async logLoginAttempt(email: string, success: boolean, error?: string): Promise<void> {
    await this.logSecurityEvent({
      action: 'login_attempt',
      success,
      details: { email, error }
    });
  },

  async logAdminAction(action: string, resourceType: string, resourceId?: string): Promise<void> {
    await this.logSecurityEvent({
      action: `admin_${action}`,
      resource_type: resourceType,
      resource_id: resourceId,
      success: true
    });
  },

  async logFailedAccess(action: string, resourceType: string): Promise<void> {
    await this.logSecurityEvent({
      action: `failed_${action}`,
      resource_type: resourceType,
      success: false
    });
  }
};
