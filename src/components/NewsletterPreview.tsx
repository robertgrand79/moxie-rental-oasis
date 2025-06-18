
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterPreviewProps {
  subject: string;
  content: string;
}

const NewsletterPreview = ({ subject, content }: NewsletterPreviewProps) => {
  const [isSendingPreview, setIsSendingPreview] = useState(false);
  const [previewEmail, setPreviewEmail] = useState('');
  const { toast } = useToast();

  const sendPreview = async () => {
    console.log('🚀 Newsletter Preview - Starting send process');
    console.log('Preview data:', { 
      email: previewEmail, 
      subject: subject, 
      contentLength: content?.length || 0,
      hasEmail: !!previewEmail,
      hasSubject: !!subject,
      hasContent: !!content
    });

    if (!previewEmail || !subject || !content) {
      console.error('❌ Missing required fields');
      toast({
        title: "Missing Information",
        description: "Please fill in the email address, subject, and content before sending a preview.",
        variant: "destructive",
      });
      return;
    }

    if (!previewEmail.includes('@')) {
      console.error('❌ Invalid email format');
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingPreview(true);

    try {
      console.log('📧 Sending newsletter preview to:', previewEmail);
      console.log('📧 Function URL check - attempting to call send-newsletter-preview-actual');
      
      const { data, error } = await supabase.functions.invoke('send-newsletter-preview-actual', {
        body: {
          email: previewEmail,
          subject: subject,
          content: content,
        }
      });

      console.log('📧 Function response received:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ Preview sent successfully');
        toast({
          title: "Preview Sent!",
          description: `Newsletter preview sent to ${previewEmail} with Moxie branding and design.`,
        });
        setPreviewEmail(''); // Clear the email field after successful send
      } else {
        console.error('❌ Function returned unsuccessful response:', data);
        throw new Error(data?.error || 'Failed to send preview - function returned unsuccessful response');
      }
    } catch (error: any) {
      console.error('❌ Preview send error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      
      let errorMessage = "Failed to send preview. ";
      
      if (error.message?.includes('Function not found')) {
        errorMessage += "The newsletter preview function is not available. Please contact support.";
      } else if (error.message?.includes('Authentication')) {
        errorMessage += "Please make sure you're logged in.";
      } else if (error.message?.includes('Email service')) {
        errorMessage += "Email service is not configured.";
      } else if (error.message?.includes('not found')) {
        errorMessage += "The preview service is not available. Please try again later.";
      } else {
        errorMessage += error.message || "Please try again later.";
      }
      
      toast({
        title: "Preview Send Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSendingPreview(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Preview Newsletter
        </CardTitle>
        <CardDescription>
          Send a test copy with Moxie's professional design and branding to any email address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Preview Email Address</Label>
            <Input
              placeholder="Enter email address for preview..."
              value={previewEmail}
              onChange={(e) => setPreviewEmail(e.target.value)}
              type="email"
              disabled={isSendingPreview}
            />
            <p className="text-xs text-gray-500 mt-1">
              The preview will include Moxie's branding, responsive design, and professional styling
            </p>
          </div>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
              Debug: Email={!!previewEmail}, Subject={!!subject}, Content={!!content}
            </div>
          )}
          
          <Button 
            onClick={sendPreview}
            disabled={isSendingPreview || !previewEmail || !subject || !content}
            variant="outline"
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            {isSendingPreview ? "Sending Preview..." : "Send Newsletter Preview"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterPreview;
