
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

export const useWorkOrderEmail = () => {
  const [emailingWorkOrders, setEmailingWorkOrders] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleEmailWorkOrder = async (
    workOrder: WorkOrder, 
    onStatusChange: (workOrderId: string, status: string) => void
  ) => {
    if (!workOrder.contractor?.email) {
      toast({
        title: 'Error',
        description: 'This work order has no contractor email assigned',
        variant: 'destructive',
      });
      return;
    }

    setEmailingWorkOrders(prev => new Set(prev).add(workOrder.id));

    try {
      const { data, error } = await supabase.functions.invoke('send-work-order-pdf', {
        body: { workOrderId: workOrder.id }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Work order PDF sent to ${workOrder.contractor.email}`,
      });

      // If status was draft, it will be updated to sent by the edge function
      if (workOrder.status === 'draft') {
        onStatusChange(workOrder.id, 'sent');
      }
    } catch (error) {
      console.error('Error sending work order PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to send work order PDF',
        variant: 'destructive',
      });
    } finally {
      setEmailingWorkOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(workOrder.id);
        return newSet;
      });
    }
  };

  return {
    emailingWorkOrders,
    handleEmailWorkOrder,
  };
};
