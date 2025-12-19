
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

export type SendMethod = 'email' | 'sms' | 'both';

export const useWorkOrderEmail = () => {
  const [emailingWorkOrders, setEmailingWorkOrders] = useState<Set<string>>(new Set());
  const [textingWorkOrders, setTextingWorkOrders] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSendWorkOrder = async (
    workOrder: WorkOrder, 
    onStatusChange: (workOrderId: string, status: string) => void,
    sendMethod: SendMethod = 'both'
  ) => {
    // Validate based on send method
    if ((sendMethod === 'email' || sendMethod === 'both') && !workOrder.contractor?.email) {
      toast({
        title: 'Error',
        description: 'This work order has no contractor email assigned',
        variant: 'destructive',
      });
      return;
    }

    if ((sendMethod === 'sms' || sendMethod === 'both') && !workOrder.contractor?.phone) {
      if (sendMethod === 'sms') {
        toast({
          title: 'Error',
          description: 'This contractor has no phone number configured',
          variant: 'destructive',
        });
        return;
      }
      // If 'both' but no phone, just send email
      if (sendMethod === 'both' && workOrder.contractor?.email) {
        sendMethod = 'email';
      }
    }

    // Track loading states
    if (sendMethod === 'email' || sendMethod === 'both') {
      setEmailingWorkOrders(prev => new Set(prev).add(workOrder.id));
    }
    if (sendMethod === 'sms' || sendMethod === 'both') {
      setTextingWorkOrders(prev => new Set(prev).add(workOrder.id));
    }

    try {
      console.log('Sending work order:', workOrder.work_order_number, 'via:', sendMethod);
      
      const { data, error } = await supabase.functions.invoke('send-work-order-pdf', {
        body: { workOrderId: workOrder.id, sendMethod }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Send result:', data);

      // Build success message
      let successMessage = '';
      if (data.emailSent && data.smsSent) {
        successMessage = `Work order sent to ${workOrder.contractor?.email} (email) and ${workOrder.contractor?.phone} (SMS)`;
      } else if (data.emailSent) {
        successMessage = `Work order email sent to ${workOrder.contractor?.email}`;
      } else if (data.smsSent) {
        successMessage = `Work order SMS sent to ${workOrder.contractor?.phone}`;
      }

      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }

      // Show SMS error if email succeeded but SMS failed
      if (data.emailSent && !data.smsSent && sendMethod === 'both' && data.smsError) {
        toast({
          title: 'SMS Warning',
          description: `Email sent, but SMS failed: ${data.smsError}`,
          variant: 'destructive',
        });
      }

      // If status was draft, it will be updated to sent by the edge function
      if (workOrder.status === 'draft' && (data.emailSent || data.smsSent)) {
        onStatusChange(workOrder.id, 'sent');
      }

    } catch (error: any) {
      console.error('Error sending work order:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to send work order';
      
      if (error?.message?.includes('403')) {
        errorMessage = 'Sending failed: Sender not verified. Please contact system administrator.';
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'Configuration error. Please contact system administrator.';
      } else if (error?.message?.includes('not found')) {
        errorMessage = 'Work order data not found. Please try again.';
      }
      
      toast({
        title: 'Send Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setEmailingWorkOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(workOrder.id);
        return newSet;
      });
      setTextingWorkOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(workOrder.id);
        return newSet;
      });
    }
  };

  // Legacy function for backwards compatibility
  const handleEmailWorkOrder = async (
    workOrder: WorkOrder, 
    onStatusChange: (workOrderId: string, status: string) => void
  ) => {
    return handleSendWorkOrder(workOrder, onStatusChange, 'both');
  };

  return {
    emailingWorkOrders,
    textingWorkOrders,
    handleEmailWorkOrder,
    handleSendWorkOrder,
  };
};
