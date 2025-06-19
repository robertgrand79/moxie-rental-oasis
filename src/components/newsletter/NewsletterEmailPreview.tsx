
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle, AlertCircle, Info } from 'lucide-react';
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
  const [lastSentDetails, setLastSentDetails] = useState<any>(null);
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
    setLastSentDetails(null);

    try {
      console.log('📧 Sending newsletter preview to:', email);
      console.log('📧 Preview details:', { 
        subject, 
        contentLength: content.length,
        timestamp: new Date().toISOString()
      });

      // Try the preview function first, then fallback to the actual function
      let data, error;
      
      try {
        const response = await supabase.functions.invoke('send-newsletter-preview', {
          body: {
            email: email,
            subject: subject,
            content: content,
          }
        });
        data = response.data;
        error = response.error;
      } catch (previewError) {
        console.log('📧 Preview function failed, trying actual function:', previewError);
        
        const response = await supabase.functions.invoke('send-newsletter-preview-actual', {
          body: {
            email: email,
            subject: subject,
            content: content,
          }
        });
        data = response.data;
        error = response.error;
      }

      console.log('📧 Preview response:', { data, error });

      if (error) {
        console.error('❌ Preview send error:', error);
        throw error;
      }

      if (data?.success) {
        setLastSentDetails(data.details);
        toast({
          title: "Preview Sent Successfully!",
          description: `Newsletter preview has been sent to ${email}. Check your inbox (and spam folder).`,
        });

        // Store the email in localStorage for next use
        localStorage.setItem('newsletter-preview-email', email);
      } else {
        throw new Error(data?.error || "Failed to send preview email");
      }
    } catch (error: any) {
      console.error('❌ Preview send error:', error);
      
      let errorMessage = "Failed to send preview email. Please try again.";
      
      if (error.message) {
        if (error.message.includes("Authentication")) {
          errorMessage = "Please log in again to send preview emails.";
        } else if (error.message.includes("Admin access required")) {
          errorMessage = "Admin access is required to send newsletter previews.";
        } else if (error.message.includes("SENDGRID_API_KEY")) {
          errorMessage = "Email service is not configured. Please contact the administrator.";
        } else if (error.message.includes("Email delivery failed")) {
          errorMessage = "Email delivery failed. Please check your SendGrid configuration.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Send Failed",
        description: errorMessage,
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

        {lastSentDetails && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>✅ Preview sent successfully!</strong>
              <br />
              <span className="text-sm">
                To: {lastSentDetails.to} | From: {lastSentDetails.fromName}
                <br />
                Subject: {lastSentDetails.subject}
                <br />
                Sent at: {new Date(lastSentDetails.timestamp).toLocaleString()}
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Preview Features:</p>
              <ul className="mt-1 space-y-1 text-blue-800">
                <li>• Uses your current contact information from settings</li>
                <li>• Shows exactly what subscribers will receive</li>
                <li>• Includes professional Moxie branding</li>
                <li>• Subject line marked as [PREVIEW]</li>
                <li>• Blue banner indicates it's a preview email</li>
              </ul>
            </div>
          </div>
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>📧 Email Delivery Tips:</strong>
            <br />
            <span className="text-sm">
              • Check your spam/junk folder if you don't see the email
              <br />
              • Make sure your SendGrid API key is properly configured
              <br />
              • Verify that your sender email is verified in SendGrid
            </span>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default NewsletterEmailPreview;
