
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SMSResult {
  success: boolean;
  sentCount: number;
  failedCount?: number;
  totalSubscribers: number;
  message: string;
  errors?: string[];
}

export const useNewsletterSMS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendNewsletterSMS = async (message: string, subscriberIds?: string[]): Promise<SMSResult | null> => {
    try {
      setIsLoading(true);
      console.log('📱 Sending newsletter SMS...');

      const { data, error } = await supabase.functions.invoke('send-newsletter-sms', {
        body: {
          message,
          subscriberIds,
        }
      });

      if (error) {
        console.error('❌ Newsletter SMS error:', error);
        throw error;
      }

      const result: SMSResult = data;

      if (result.success) {
        toast({
          title: "SMS Newsletter Sent! 📱",
          description: `Successfully sent to ${result.sentCount} subscribers${result.failedCount ? ` (${result.failedCount} failed)` : ''}.`,
          variant: result.failedCount && result.failedCount > 0 ? "default" : "default",
        });
      } else {
        throw new Error(result.message || 'Failed to send SMS newsletter');
      }

      return result;
    } catch (err: any) {
      console.error('❌ SMS newsletter send failed:', err);
      
      let errorMessage = "Failed to send SMS newsletter.";
      
      if (err.message?.includes("API key")) {
        errorMessage = "OpenPhone API key issue. Please check your configuration.";
      } else if (err.message?.includes("rate limit")) {
        errorMessage = "SMS rate limit exceeded. Please wait before trying again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: "SMS Send Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendSMS = async (to: string, message: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log(`📱 Sending SMS to ${to}...`);

      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to,
          message,
        }
      });

      if (error) {
        console.error('❌ SMS send error:', error);
        throw error;
      }

      if (data.success) {
        toast({
          title: "SMS Sent! 📱",
          description: `Message sent successfully to ${to}`,
        });
        return true;
      } else {
        throw new Error(data.error || 'Failed to send SMS');
      }
    } catch (err: any) {
      console.error('❌ SMS send failed:', err);
      
      toast({
        title: "SMS Send Failed",
        description: err.message || "Failed to send SMS message.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendNewsletterSMS,
    sendSMS,
    isLoading,
  };
};
