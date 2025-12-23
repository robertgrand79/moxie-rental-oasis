import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from './useNotifications';

/**
 * Hook for creating system-level notifications
 * Used for low availability alerts, revenue milestones, security notifications, etc.
 */
export const useSystemNotifications = () => {
  const { organization } = useCurrentOrganization();

  /**
   * Create a low availability alert when property availability drops below threshold
   */
  const createLowAvailabilityAlert = useCallback(async (params: {
    propertyId: string;
    propertyName: string;
    availableDays: number;
    periodDays: number;
    occupancyRate: number;
  }) => {
    if (!organization?.id) return;

    const { propertyId, propertyName, availableDays, periodDays, occupancyRate } = params;
    
    await supabase.from('admin_notifications').insert({
      organization_id: organization.id,
      user_id: null, // Notify all admins
      notification_type: NOTIFICATION_TYPES.LOW_AVAILABILITY,
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      title: `Low Availability: ${propertyName}`,
      message: `${propertyName} has only ${availableDays} days available in the next ${periodDays} days (${Math.round(occupancyRate)}% occupied).`,
      action_url: `/admin/calendar?property=${propertyId}`,
      priority: availableDays < 3 ? 'high' : 'normal',
      metadata: {
        property_id: propertyId,
        property_name: propertyName,
        available_days: availableDays,
        period_days: periodDays,
        occupancy_rate: occupancyRate,
      },
    });
  }, [organization?.id]);

  /**
   * Create a revenue milestone notification
   */
  const createRevenueMilestone = useCallback(async (params: {
    milestone: string;
    amount: number;
    period: string;
    previousAmount?: number;
  }) => {
    if (!organization?.id) return;

    const { milestone, amount, period, previousAmount } = params;
    const growth = previousAmount ? Math.round(((amount - previousAmount) / previousAmount) * 100) : null;
    
    await supabase.from('admin_notifications').insert({
      organization_id: organization.id,
      user_id: null,
      notification_type: NOTIFICATION_TYPES.REVENUE_MILESTONE,
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      title: `Revenue Milestone: ${milestone}`,
      message: growth 
        ? `You've reached $${amount.toLocaleString()} in ${period} revenue! That's ${growth}% growth.`
        : `Congratulations! You've reached $${amount.toLocaleString()} in ${period} revenue.`,
      action_url: '/admin/analytics',
      priority: 'normal',
      metadata: {
        milestone,
        amount,
        period,
        previous_amount: previousAmount,
        growth_percentage: growth,
      },
    });
  }, [organization?.id]);

  /**
   * Create a security alert notification
   */
  const createSecurityAlert = useCallback(async (params: {
    alertType: 'login_attempt' | 'permission_change' | 'api_key_usage' | 'suspicious_activity';
    title: string;
    message: string;
    details?: Record<string, any>;
  }) => {
    if (!organization?.id) return;

    const { alertType, title, message, details } = params;
    
    await supabase.from('admin_notifications').insert({
      organization_id: organization.id,
      user_id: null,
      notification_type: NOTIFICATION_TYPES.SECURITY_ALERT,
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      title,
      message,
      action_url: '/admin/settings/security',
      priority: alertType === 'suspicious_activity' ? 'urgent' : 'high',
      metadata: {
        alert_type: alertType,
        ...details,
      },
    });
  }, [organization?.id]);

  /**
   * Create an API error notification
   */
  const createApiErrorAlert = useCallback(async (params: {
    serviceName: string;
    errorMessage: string;
    errorCount?: number;
    lastOccurred?: string;
  }) => {
    if (!organization?.id) return;

    const { serviceName, errorMessage, errorCount, lastOccurred } = params;
    
    await supabase.from('admin_notifications').insert({
      organization_id: organization.id,
      user_id: null,
      notification_type: NOTIFICATION_TYPES.API_ERROR,
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      title: `API Error: ${serviceName}`,
      message: errorCount && errorCount > 1 
        ? `${serviceName} integration has failed ${errorCount} times. Last error: ${errorMessage}`
        : `${serviceName} integration error: ${errorMessage}`,
      action_url: '/admin/settings/services',
      priority: errorCount && errorCount > 5 ? 'high' : 'normal',
      metadata: {
        service_name: serviceName,
        error_message: errorMessage,
        error_count: errorCount,
        last_occurred: lastOccurred,
      },
    });
  }, [organization?.id]);

  /**
   * Create a generic system alert
   */
  const createSystemAlert = useCallback(async (params: {
    title: string;
    message: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    actionUrl?: string;
    metadata?: Record<string, any>;
  }) => {
    if (!organization?.id) return;

    const { title, message, priority = 'normal', actionUrl, metadata } = params;
    
    await supabase.from('admin_notifications').insert({
      organization_id: organization.id,
      user_id: null,
      notification_type: NOTIFICATION_TYPES.SYSTEM_ALERT,
      category: NOTIFICATION_CATEGORIES.SYSTEM,
      title,
      message,
      action_url: actionUrl || '/admin',
      priority,
      metadata: metadata || {},
    });
  }, [organization?.id]);

  return {
    createLowAvailabilityAlert,
    createRevenueMilestone,
    createSecurityAlert,
    createApiErrorAlert,
    createSystemAlert,
  };
};
