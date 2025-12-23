import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CreateNotificationParams {
  organizationId: string;
  userId?: string | null;
  notificationType: string;
  category: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Creates an admin notification in the database.
 * The database trigger will automatically invoke send-instant-notification edge function.
 */
export async function createAdminNotification(
  supabase: ReturnType<typeof createClient>,
  params: CreateNotificationParams
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        organization_id: params.organizationId,
        user_id: params.userId || null,
        notification_type: params.notificationType,
        category: params.category,
        title: params.title,
        message: params.message,
        action_url: params.actionUrl || null,
        metadata: params.metadata || {},
        priority: params.priority || 'normal',
        is_read: false,
        is_archived: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[createAdminNotification] Error:', error);
      return { success: false, error: error.message };
    }

    console.log('[createAdminNotification] Created notification:', data.id);
    return { success: true, notificationId: data.id };
  } catch (err: any) {
    console.error('[createAdminNotification] Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Notification type constants for consistency
 */
export const NOTIFICATION_TYPES = {
  // Booking notifications
  NEW_BOOKING: 'new_booking',
  BOOKING_CANCELLED: 'booking_cancelled',
  CHECK_IN_TODAY: 'check_in_today',
  CHECK_OUT_TODAY: 'check_out_today',
  
  // Communication notifications
  GUEST_MESSAGE: 'guest_message',
  
  // Operations notifications
  WORK_ORDER: 'work_order',
  WORK_ORDER_CREATED: 'work_order_created',
  WORK_ORDER_COMPLETED: 'work_order_completed',
  
  // Payment notifications
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  
  // System notifications
  SYSTEM_ALERT: 'system_alert',
  LOW_AVAILABILITY: 'low_availability',
  REVENUE_MILESTONE: 'revenue_milestone',
  SECURITY_ALERT: 'security_alert',
  API_ERROR: 'api_error',
} as const;

export const NOTIFICATION_CATEGORIES = {
  BOOKINGS: 'bookings',
  COMMUNICATIONS: 'communications',
  OPERATIONS: 'operations',
  MAINTENANCE: 'maintenance',
  PAYMENTS: 'payments',
  SYSTEM: 'system',
} as const;
