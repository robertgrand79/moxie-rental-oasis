
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export async function getAcknowledgementToken(supabase: SupabaseClient, token: string) {
  console.log('Searching for token in database...');

  const { data: tokenData, error: tokenError } = await supabase
    .from('work_order_acknowledgement_tokens')
    .select(`
      *,
      work_order:work_orders(
        id,
        work_order_number,
        title,
        status,
        contractor:contractors(name, email)
      )
    `)
    .eq('token', token)
    .single();

  console.log('Database query result:', {
    found: !!tokenData,
    error: tokenError?.message || 'None'
  });

  if (tokenError || !tokenData) {
    console.error('Token lookup failed:', tokenError);
    throw new Error('Invalid or expired acknowledgement link');
  }

  return tokenData;
}

export async function updateWorkOrderStatus(supabase: SupabaseClient, workOrderId: string) {
  console.log('Processing acknowledgement - updating work order status...');

  const { error: updateError } = await supabase
    .from('work_orders')
    .update({
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString()
    })
    .eq('id', workOrderId);

  if (updateError) {
    console.error('Error updating work order:', updateError);
    throw new Error('Failed to acknowledge work order - database update failed');
  }

  console.log('Work order status updated successfully');
}

export async function markTokenAsUsed(supabase: SupabaseClient, tokenId: string) {
  const { error: tokenUpdateError } = await supabase
    .from('work_order_acknowledgement_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenId);

  if (tokenUpdateError) {
    console.error('Error marking token as used:', tokenUpdateError);
    // Don't fail the request for this, just log it
  }
}

export function validateToken(tokenData: any): { isExpired: boolean; isUsed: boolean } {
  console.log('Token found - Work Order:', tokenData.work_order?.work_order_number);
  console.log('Token expires at:', tokenData.expires_at);
  console.log('Token already used:', !!tokenData.used_at);

  const isExpired = new Date(tokenData.expires_at) < new Date();
  const isUsed = !!tokenData.used_at;

  if (isExpired) {
    console.log('ERROR: Token has expired');
  }

  return { isExpired, isUsed };
}
