
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createAcknowledgementToken(
  supabase: SupabaseClient,
  workOrderId: string
): Promise<{ token: string; acknowledgementUrl: string }> {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { error: tokenError } = await supabase
    .from('work_order_acknowledgement_tokens')
    .insert({
      work_order_id: workOrderId,
      token,
      expires_at: expiresAt.toISOString(),
    });

  if (tokenError) {
    console.error('Error creating acknowledgement token:', tokenError);
    throw new Error('Failed to create acknowledgement token');
  }

  // Generate the React-based acknowledgement URL
  const acknowledgementUrl = `https://joiovubyokikqjytxtuv.lovable.app/work-order-acknowledgment/${encodeURIComponent(token)}`;

  return { token, acknowledgementUrl };
}
