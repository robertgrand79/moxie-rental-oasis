
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
      console.log('Sending work order email for:', workOrder.work_order_number);
      
      const { data, error } = await supabase.functions.invoke('send-work-order-pdf', {
        body: { workOrderId: workOrder.id }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Email sent successfully:', data);

      toast({
        title: 'Success',
        description: `Work order email sent to ${workOrder.contractor.email}. They will confirm receipt by replying to the email.`,
      });

      // If status was draft, it will be updated to sent by the edge function
      if (workOrder.status === 'draft') {
        onStatusChange(workOrder.id, 'sent');
      }

    } catch (error) {
      console.error('Error sending work order email:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to send work order email';
      
      if (error?.message?.includes('403')) {
        errorMessage = 'Email sending failed: Sender email not verified. Please contact system administrator.';
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'Email configuration error. Please contact system administrator.';
      } else if (error?.message?.includes('not found')) {
        errorMessage = 'Work order data not found. Please try again.';
      }
      
      toast({
        title: 'Email Error',
        description: errorMessage,
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
