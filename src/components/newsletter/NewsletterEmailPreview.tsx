
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterEmailPreviewProps {
  subject: string;
  content: string;
  disabled?: boolean;
}

const NewsletterEmailPreview = ({ subject, content, disabled = false }: NewsletterEmailPreviewProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendPreview = async () => {
    if (!email || !subject || !content) {
      toast({
        title: "Missing Information",
        description: "Please enter an email address and ensure the newsletter has a subject and content.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('📧 Sending newsletter preview to:', email);
      const { data, error } = await supabase.functions.invoke('send-newsletter-preview-actual', {
        body: {
          email: email,
          subject: subject,
          content: content,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Preview Sent!",
        description: `Newsletter preview has been sent to ${email}`,
      });

      // Store the email in localStorage for next use
      localStorage.setItem('newsletter-preview-email', email);
    } catch (error: any) {
      console.error('Preview send error:', error);
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send preview email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved email on component mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('newsletter-preview-email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Send Preview Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preview-email">Preview Email Address</Label>
          <Input
            id="preview-email"
            type="email"
            placeholder="Enter your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled || isLoading}
          />
        </div>

        <Button
          onClick={handleSendPreview}
          disabled={disabled || isLoading || !email || !subject || !content}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending Preview...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Preview Email
            </>
          )}
        </Button>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Preview Features:</p>
              <ul className="mt-1 space-y-1 text-blue-800">
                <li>• Uses your current contact information</li>
                <li>• Shows exactly what subscribers will receive</li>
                <li>• Includes professional Moxie branding</li>
                <li>• Subject line marked as [PREVIEW]</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterEmailPreview;
