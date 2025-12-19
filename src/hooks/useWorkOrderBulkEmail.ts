import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWorkOrderBulkEmail = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendBulkWorkOrders = async (workOrderIds: string[], contractorId: string) => {
    if (workOrderIds.length === 0) {
      toast({
        title: 'No work orders selected',
        description: 'Please select at least one work order to send.',
        variant: 'destructive',
      });
      return false;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-bulk-work-orders', {
        body: { workOrderIds, contractorId },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: data.message || `Sent ${workOrderIds.length} work order(s) successfully`,
      });

      return true;
    } catch (error: any) {
      console.error('Error sending bulk work orders:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send work orders',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    sendBulkWorkOrders,
  };
};
