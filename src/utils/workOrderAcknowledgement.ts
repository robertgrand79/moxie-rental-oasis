
import { supabase } from '@/integrations/supabase/client';

export interface AcknowledgementToken {
  id: string;
  work_order_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

/**
 * Generates a cryptographically secure random token
 */
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates an acknowledgement token for a work order
 */
export async function createAcknowledgementToken(workOrderId: string): Promise<AcknowledgementToken | null> {
  try {
    const token = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const { data, error } = await supabase
      .from('work_order_acknowledgement_tokens')
      .insert({
        work_order_id: workOrderId,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating acknowledgement token:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error generating acknowledgement token:', error);
    return null;
  }
}

/**
 * Generates the acknowledgement URL for a work order
 */
export function generateAcknowledgementUrl(token: string): string {
  const baseUrl = 'https://joiovubyokikqjytxtuv.supabase.co/functions/v1/acknowledge-work-order';
  return `${baseUrl}?token=${encodeURIComponent(token)}`;
}

/**
 * Checks if a work order has been acknowledged
 */
export async function isWorkOrderAcknowledged(workOrderId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('work_order_acknowledgement_tokens')
      .select('used_at')
      .eq('work_order_id', workOrderId)
      .not('used_at', 'is', null)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking acknowledgement status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking acknowledgement status:', error);
    return false;
  }
}
