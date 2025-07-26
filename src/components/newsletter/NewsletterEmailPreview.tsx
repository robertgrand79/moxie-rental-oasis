
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle, AlertCircle, Info, Settings, ExternalLink, Bug } from 'lucide-react';
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
  const [setupError, setSetupError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  const handleSendPreview = async () => {
    console.log('🚀 Preview send initiated');
    console.log('📝 Form data:', { email, subject: subject?.substring(0, 50), contentLength: content?.length });

    if (!email || !subject || !content) {
      console.error('❌ Missing required fields:', { email: !!email, subject: !!subject, content: !!content });
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
      console.error('❌ Invalid email format:', email);
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLastSentDetails(null);
    setSetupError(null);
    setDebugInfo(null);

    try {
      console.log('📧 Calling send-newsletter-preview function...');
      
      const payload = {
        email: email,
        subject: subject,
        content: content,
      };
      
      console.log('📤 Payload being sent:', {
        email: payload.email,
        subject: payload.subject?.substring(0, 50) + '...',
        contentLength: payload.content?.length
      });

      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('send-newsletter-preview', {
        body: payload
      });
      const endTime = Date.now();

      console.log('📧 Function response received in', endTime - startTime, 'ms');
      console.log('📧 Response data:', data);
      console.log('📧 Response error:', error);

      // Set debug info for troubleshooting
      setDebugInfo({
        requestTime: endTime - startTime,
        payload: {
          email: payload.email,
          subjectLength: payload.subject?.length,
          contentLength: payload.content?.length
        },
        response: data,
        error: error
      });

      if (error) {
        console.error('❌ Function invocation error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ Preview sent successfully:', data);
        setLastSentDetails(data.details);
        toast({
          title: "Preview Sent Successfully!",
          description: `Newsletter preview has been sent to ${email}. Check your inbox (and spam folder).`,
        });

        // Store the email in localStorage for next use
        localStorage.setItem('newsletter-preview-email', email);
      } else {
        console.error('❌ Function returned failure:', data);
        throw new Error(data?.error || "Failed to send preview email");
      }
    } catch (error: any) {
      console.error('❌ Preview send error:', error);
      
      let errorMessage = "Failed to send preview email.";
      let isSetupError = false;
      
      if (error.message) {
        if (error.message.includes("RESEND_API_KEY") || error.message.includes("Email service not configured")) {
          errorMessage = "Resend API key is not configured.";
          isSetupError = true;
        } else if (error.message.includes("Authentication") || error.message.includes("log in")) {
          errorMessage = "Please log in again to send preview emails.";
        } else if (error.message.includes("Admin access required")) {
          errorMessage = "Admin access is required to send newsletter previews.";
        } else if (error.message.includes("Email delivery failed") || error.message.includes("Resend")) {
          errorMessage = "Email delivery failed. Please check your Resend configuration.";
          isSetupError = true;
        } else if (error.message.includes("Invalid JSON") || error.message.includes("request body")) {
          errorMessage = "Request formatting error. Please try again or contact support.";
        } else {
          errorMessage = error.message;
        }
      }

      if (isSetupError) {
        setSetupError(errorMessage);
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
        {setupError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>⚙️ Setup Required:</strong>
              <br />
              {setupError}
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://resend.com/api-keys', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get Resend API Key
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://supabase.com/dashboard/project/joiovubyokikqjytxtuv/settings/functions`, '_blank')}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Add to Supabase
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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

        {debugInfo && (
          <Alert className="border-blue-200 bg-blue-50">
            <Bug className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>🔍 Debug Information:</strong>
              <br />
              <span className="text-xs">
                Request time: {debugInfo.requestTime}ms
                <br />
                Email: {debugInfo.payload?.email}
                <br />
                Subject length: {debugInfo.payload?.subjectLength} chars
                <br />
                Content length: {debugInfo.payload?.contentLength} chars
                <br />
                {debugInfo.error && `Error: ${JSON.stringify(debugInfo.error)}`}
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
                <li>• Includes professional Moxie branding with modern design</li>
                <li>• Subject line marked as [PREVIEW]</li>
                <li>• Blue banner indicates it's a preview email</li>
              </ul>
            </div>
          </div>
        </div>

        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>📧 Troubleshooting Tips:</strong>
            <br />
            <span className="text-sm">
              • Check your spam/junk folder if you don't see the email
              <br />
              • Ensure your Resend API key is configured in Supabase secrets
              <br />
              • Verify that your sender email is verified in Resend
              <br />
              • Make sure you're logged in as an admin user
              <br />
              • Check browser console for detailed error logs
            </span>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default NewsletterEmailPreview;
