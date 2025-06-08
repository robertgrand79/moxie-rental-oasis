
// Temporary audit service that logs to console until security_audit_log table types are available

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
      // Temporarily log to console until database types are updated
      console.log('Security Audit Event:', {
        timestamp: new Date().toISOString(),
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent || navigator.userAgent,
        success: entry.success ?? true,
        details: entry.details
      });
      
      // TODO: Uncomment when security_audit_log table is available in types
      // const { data: { user } } = await supabase.auth.getUser();
      // 
      // await supabase
      //   .from('security_audit_log')
      //   .insert({
      //     user_id: user?.id,
      //     action: entry.action,
      //     resource_type: entry.resource_type,
      //     resource_id: entry.resource_id,
      //     ip_address: entry.ip_address,
      //     user_agent: entry.user_agent || navigator.userAgent,
      //     success: entry.success ?? true,
      //     details: entry.details
      //   });
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
