/**
 * Platform Admin Audit Logging Hook
 * 
 * Provides functions to log all platform admin actions to the database.
 * These logs are displayed in the Platform Audit Log page.
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AuditActionType = 
  | 'login'
  | 'impersonation_start'
  | 'impersonation_end'
  | 'org_update'
  | 'user_update'
  | 'subscription_change'
  | 'account_suspend'
  | 'account_reactivate'
  | 'account_delete'
  | 'settings_change'
  | 'api_key_update';

export type AuditTargetType = 
  | 'organization'
  | 'user'
  | 'subscription'
  | 'settings'
  | 'api_key';

interface AuditLogParams {
  actionType: AuditActionType;
  targetType?: AuditTargetType;
  targetId?: string;
  targetName?: string;
  details?: Record<string, unknown>;
}

export const usePlatformAdminAudit = () => {
  const { user } = useAuth();

  /**
   * Log a platform admin action to the audit log
   */
  const logAction = useCallback(async (params: AuditLogParams): Promise<void> => {
    if (!user?.id) {
      console.warn('Cannot log audit action: No authenticated user');
      return;
    }

    try {
      // Get admin record ID
      const { data: adminRecord } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const { error } = await supabase
        .from('platform_admin_audit_logs')
        .insert([{
          admin_user_id: user.id,
          admin_id: adminRecord?.id || user.id,
          action_type: params.actionType,
          target_type: params.targetType || null,
          target_id: params.targetId || null,
          target_name: params.targetName || null,
          details: (params.details || {}) as unknown as Record<string, string | number | boolean | null>,
          user_agent: navigator?.userAgent || null,
          session_id: sessionStorage.getItem('session_id') || null,
        }]);

      if (error) {
        console.error('Failed to log platform admin action:', error);
      }
    } catch (err) {
      console.error('Error logging platform admin action:', err);
    }
  }, [user?.id]);

  /**
   * Log platform admin login
   */
  const logLogin = useCallback(() => {
    return logAction({
      actionType: 'login',
      details: {
        timestamp: new Date().toISOString(),
        method: 'password',
      },
    });
  }, [logAction]);

  /**
   * Log impersonation start (switching to tenant view)
   */
  const logImpersonationStart = useCallback((
    orgId: string,
    orgName: string
  ) => {
    return logAction({
      actionType: 'impersonation_start',
      targetType: 'organization',
      targetId: orgId,
      targetName: orgName,
      details: {
        started_at: new Date().toISOString(),
      },
    });
  }, [logAction]);

  /**
   * Log impersonation end (returning to platform mode)
   */
  const logImpersonationEnd = useCallback((
    orgId?: string,
    orgName?: string
  ) => {
    return logAction({
      actionType: 'impersonation_end',
      targetType: orgId ? 'organization' : undefined,
      targetId: orgId,
      targetName: orgName,
      details: {
        ended_at: new Date().toISOString(),
      },
    });
  }, [logAction]);

  /**
   * Log organization update
   */
  const logOrganizationUpdate = useCallback((
    orgId: string,
    orgName: string,
    changes: Record<string, unknown>
  ) => {
    return logAction({
      actionType: 'org_update',
      targetType: 'organization',
      targetId: orgId,
      targetName: orgName,
      details: {
        changes,
        updated_at: new Date().toISOString(),
      },
    });
  }, [logAction]);

  /**
   * Log subscription change
   */
  const logSubscriptionChange = useCallback((
    orgId: string,
    orgName: string,
    fromTier: string,
    toTier: string
  ) => {
    return logAction({
      actionType: 'subscription_change',
      targetType: 'subscription',
      targetId: orgId,
      targetName: orgName,
      details: {
        from_tier: fromTier,
        to_tier: toTier,
        changed_at: new Date().toISOString(),
      },
    });
  }, [logAction]);

  /**
   * Log account suspension
   */
  const logAccountSuspend = useCallback((
    orgId: string,
    orgName: string,
    reason?: string
  ) => {
    return logAction({
      actionType: 'account_suspend',
      targetType: 'organization',
      targetId: orgId,
      targetName: orgName,
      details: {
        reason,
        suspended_at: new Date().toISOString(),
      },
    });
  }, [logAction]);

  /**
   * Log account reactivation
   */
  const logAccountReactivate = useCallback((
    orgId: string,
    orgName: string
  ) => {
    return logAction({
      actionType: 'account_reactivate',
      targetType: 'organization',
      targetId: orgId,
      targetName: orgName,
      details: {
        reactivated_at: new Date().toISOString(),
      },
    });
  }, [logAction]);

  /**
   * Log account deletion
   */
  const logAccountDelete = useCallback((
    orgId: string,
    orgName: string
  ) => {
    return logAction({
      actionType: 'account_delete',
      targetType: 'organization',
      targetId: orgId,
      targetName: orgName,
      details: {
        deleted_at: new Date().toISOString(),
      },
    });
  }, [logAction]);

  /**
   * Log user update
   */
  const logUserUpdate = useCallback((
    userId: string,
    userEmail: string,
    changes: Record<string, unknown>
  ) => {
    return logAction({
      actionType: 'user_update',
      targetType: 'user',
      targetId: userId,
      targetName: userEmail,
      details: {
        changes,
        updated_at: new Date().toISOString(),
      },
    });
  }, [logAction]);

  /**
   * Log settings change
   */
  const logSettingsChange = useCallback((
    settingName: string,
    changes: Record<string, unknown>
  ) => {
    return logAction({
      actionType: 'settings_change',
      targetType: 'settings',
      targetName: settingName,
      details: {
        changes,
        changed_at: new Date().toISOString(),
      },
    });
  }, [logAction]);

  return {
    logAction,
    logLogin,
    logImpersonationStart,
    logImpersonationEnd,
    logOrganizationUpdate,
    logSubscriptionChange,
    logAccountSuspend,
    logAccountReactivate,
    logAccountDelete,
    logUserUpdate,
    logSettingsChange,
  };
};
