import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface EmailFailure {
  id?: string;
  organization_id: string | null;
  recipient_email: string;
  subject: string;
  error_message: string;
  error_code?: string;
  email_type: string;
  payload: Record<string, any>;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  status: 'pending' | 'retrying' | 'failed' | 'success';
  created_at?: string;
  updated_at?: string;
}

/**
 * Log an email failure for potential retry
 */
export async function logEmailFailure(
  supabase: ReturnType<typeof createClient>,
  failure: Omit<EmailFailure, 'id' | 'created_at' | 'updated_at' | 'status'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Calculate next retry time with exponential backoff
    const retryDelayMinutes = Math.pow(2, failure.retry_count) * 5; // 5, 10, 20, 40 minutes
    const nextRetryAt = new Date(Date.now() + retryDelayMinutes * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('email_failures')
      .insert({
        organization_id: failure.organization_id,
        recipient_email: failure.recipient_email,
        subject: failure.subject,
        error_message: failure.error_message,
        error_code: failure.error_code || null,
        email_type: failure.email_type,
        payload: failure.payload,
        retry_count: failure.retry_count,
        max_retries: failure.max_retries,
        next_retry_at: failure.retry_count < failure.max_retries ? nextRetryAt : null,
        status: failure.retry_count < failure.max_retries ? 'pending' : 'failed',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[EmailFailureHandler] Error logging failure:', error);
      return { success: false, error: error.message };
    }

    console.log('[EmailFailureHandler] Logged email failure:', data.id);
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('[EmailFailureHandler] Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Mark an email failure as successfully retried
 */
export async function markEmailRetrySuccess(
  supabase: ReturnType<typeof createClient>,
  failureId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('email_failures')
      .update({
        status: 'success',
        next_retry_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', failureId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Increment retry count for a failed email
 */
export async function incrementRetryCount(
  supabase: ReturnType<typeof createClient>,
  failureId: string,
  errorMessage: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current retry count
    const { data: current, error: fetchError } = await supabase
      .from('email_failures')
      .select('retry_count, max_retries')
      .eq('id', failureId)
      .single();

    if (fetchError || !current) {
      return { success: false, error: 'Failed to fetch failure record' };
    }

    const newRetryCount = current.retry_count + 1;
    const isMaxed = newRetryCount >= current.max_retries;
    
    // Calculate next retry with exponential backoff
    const retryDelayMinutes = Math.pow(2, newRetryCount) * 5;
    const nextRetryAt = isMaxed ? null : new Date(Date.now() + retryDelayMinutes * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('email_failures')
      .update({
        retry_count: newRetryCount,
        error_message: errorMessage,
        next_retry_at: nextRetryAt,
        status: isMaxed ? 'failed' : 'retrying',
        updated_at: new Date().toISOString(),
      })
      .eq('id', failureId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get pending email retries
 */
export async function getPendingRetries(
  supabase: ReturnType<typeof createClient>,
  limit: number = 50
): Promise<EmailFailure[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('email_failures')
    .select('*')
    .in('status', ['pending', 'retrying'])
    .lte('next_retry_at', now)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('[EmailFailureHandler] Error fetching pending retries:', error);
    return [];
  }

  return data || [];
}

/**
 * Email types for consistent logging
 */
export const EMAIL_TYPES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  BOOKING_MODIFICATION: 'booking_modification',
  BOOKING_CANCELLATION: 'booking_cancellation',
  CHECK_IN_REMINDER: 'check_in_reminder',
  CHECK_IN_INSTRUCTIONS: 'check_in_instructions',
  CHECK_OUT_REMINDER: 'check_out_reminder',
  REVIEW_REQUEST: 'review_request',
  PAYMENT_RECEIPT: 'payment_receipt',
  PAYMENT_FAILED: 'payment_failed',
  GUEST_MESSAGE: 'guest_message',
  WORK_ORDER: 'work_order',
  INVITATION: 'invitation',
  PASSWORD_RESET: 'password_reset',
  WELCOME: 'welcome',
  NEWSLETTER: 'newsletter',
  DAILY_RECAP: 'daily_recap',
  INSTANT_NOTIFICATION: 'instant_notification',
} as const;
