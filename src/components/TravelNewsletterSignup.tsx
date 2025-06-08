
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import NewsletterForm from './newsletter/NewsletterForm';
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
          frequency: 'weekly',
          interests: ['general'] 
        }
      });

      if (error) {
        throw error;
      }

      setIsSubscribed(true);
      setSubscribedUserName(formData.name);
      toast({
        title: "🎉 Welcome to Moxie Travel!",
        description: "You'll receive our travel insights and Eugene adventures.",
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

  return <NewsletterForm onSubmit={handleSubmit} isLoading={isLoading} />;
};

export default TravelNewsletterSignup;
