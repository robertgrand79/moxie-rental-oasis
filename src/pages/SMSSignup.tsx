
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EnhancedNewsletterForm from '@/components/newsletter/EnhancedNewsletterForm';
import NewsletterSuccess from '@/components/newsletter/NewsletterSuccess';
import { NewsletterFormData } from '@/components/newsletter/types';
import { MessageSquare, Phone } from 'lucide-react';

const SMSSignup = () => {
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
          contactSource: 'sms_signup'
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
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <NewsletterSuccess userName={subscribedUserName} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <Phone className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Stay Connected with Moxie Travel
          </h1>
          <p className="text-gray-600 text-sm">
            Get instant travel tips, Eugene local secrets, and exclusive updates directly to your phone and email.
          </p>
        </div>

        {/* Form */}
        <EnhancedNewsletterForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          showSMSOption={true}
          title="Quick Signup"
          description="Choose how you'd like to receive our travel insights - via email, SMS, or both!"
        />

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            By subscribing, you agree to receive communications from Moxie Travel. 
            You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SMSSignup;
