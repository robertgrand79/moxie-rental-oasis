
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
      const { error } = await supabase.functions.invoke('send-newsletter-preview', {
        body: {
          email: previewEmail,
          subject: subject,
          content: content,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Preview Sent!",
        description: `Preview newsletter sent to ${previewEmail}`,
      });
    } catch (error: any) {
      console.error('Preview send error:', error);
      toast({
        title: "Preview Send Failed",
        description: error.message || "Please try again later.",
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
          Send a test copy to any email address before sending to all subscribers
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
          </div>
          <Button 
            onClick={sendPreview}
            disabled={isSendingPreview || !previewEmail || !subject || !content}
            variant="outline"
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            {isSendingPreview ? "Sending Preview..." : "Send Preview"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterPreview;
