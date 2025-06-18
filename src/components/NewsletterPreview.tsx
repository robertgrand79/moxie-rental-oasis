
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
    if (!previewEmail || !subject || !content) {
      toast({
        title: "Missing Information",
        description: "Please fill in the email address, subject, and content before sending a preview.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingPreview(true);

    try {
      console.log('Sending newsletter preview to:', previewEmail);
      
      const { data, error } = await supabase.functions.invoke('send-newsletter-preview-actual', {
        body: {
          email: previewEmail,
          subject: subject,
          content: content,
        }
      });

      console.log('Newsletter preview response:', { data, error });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Preview Sent!",
          description: `Newsletter preview sent to ${previewEmail} with Moxie branding and design.`,
        });
      } else {
        throw new Error(data?.error || 'Failed to send preview');
      }
    } catch (error: any) {
      console.error('Preview send error:', error);
      
      let errorMessage = "Failed to send preview. ";
      if (error.message?.includes('Authentication')) {
        errorMessage += "Please make sure you're logged in.";
      } else if (error.message?.includes('Email service')) {
        errorMessage += "Email service is not configured.";
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
            />
            <p className="text-xs text-gray-500 mt-1">
              The preview will include Moxie's branding, responsive design, and professional styling
            </p>
          </div>
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
