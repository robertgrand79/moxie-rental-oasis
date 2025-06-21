
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

export async function fetchWorkOrderWithDetails(
  supabase: SupabaseClient,
  workOrderId: string
): Promise<any> {
  const { data: workOrder, error: fetchError } = await supabase
    .from('work_orders')
    .select(`
      *,
      contractor:contractors(*),
      property:properties(*)
    `)
    .eq('id', workOrderId)
    .single();

  if (fetchError || !workOrder) {
    console.error('Work order not found:', fetchError);
    throw new Error('Work order not found');
  }

  if (!workOrder.contractor?.email) {
    throw new Error('No contractor email found for this work order');
  }

  return workOrder;
}

export async function updateWorkOrderStatus(
  supabase: SupabaseClient,
  workOrderId: string,
  currentStatus: string
): Promise<void> {
  if (currentStatus === 'draft') {
    const { error: updateError } = await supabase
      .from('work_orders')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', workOrderId);

    if (updateError) {
      console.error('Error updating work order status:', updateError);
    }
  }
}
