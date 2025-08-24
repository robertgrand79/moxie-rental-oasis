
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StreamlinedNewsletterForm from './newsletter/StreamlinedNewsletterForm';
import NewsletterSuccess from './newsletter/NewsletterSuccess';
import { NewsletterFormData } from './newsletter/types';

const TravelNewsletterSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedUserName, setSubscribedUserName] = useState<string>('');
  const { toast } = useToast();

  const handleSubmit = async (formData: NewsletterFormData) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { 
          email: formData.email, 
          name: formData.name,
          phone: formData.phone || null,
          emailOptIn: formData.emailOptIn,
          smsOptIn: formData.smsOptIn,
          communicationPreferences: formData.communicationPreferences,
          contactSource: 'newsletter'
        }
      });

      if (error) {
        throw error;
      }

      setIsSubscribed(true);
      setSubscribedUserName(formData.name);
      
      const methods = [];
      if (formData.emailOptIn) methods.push('email');
      if (formData.smsOptIn) methods.push('SMS');
      
      toast({
        title: "🎉 Welcome to Moxie Travel!",
        description: `You'll receive updates via ${methods.join(' and ')}.`,
      });
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return <NewsletterSuccess userName={subscribedUserName} />;
  }

  return <StreamlinedNewsletterForm onSubmit={handleSubmit} isLoading={isLoading} />;
};

export default TravelNewsletterSignup;
