
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Smartphone, Monitor, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import NewsletterTemplate from './NewsletterTemplate';
import { parseContentToSections, generatePreheader, enhanceWithImages } from './NewsletterContentParser';

interface EnhancedNewsletterPreviewProps {
  subject: string;
  content: string;
}

const EnhancedNewsletterPreview = ({ subject, content }: EnhancedNewsletterPreviewProps) => {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  const [isSendingPreview, setIsSendingPreview] = useState(false);
  const [previewEmail, setPreviewEmail] = useState('');
  const { toast } = useToast();
  
  const sections = enhanceWithImages(parseContentToSections(content, subject));
  const preheader = generatePreheader(subject, content);

  const sendPreview = async () => {
    console.log('🚀 Enhanced Newsletter Preview - Starting send process');
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
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Newsletter Preview & Send
            </CardTitle>
            <CardDescription>
              Preview your newsletter with Moxie's professional design and send a test copy
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="h-4 w-4 mr-1" />
              Desktop
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="h-4 w-4 mr-1" />
              Mobile
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview Section */}
        <div className="border rounded-lg overflow-hidden bg-gray-50">
          {/* Email Client Header */}
          <div className="bg-white border-b px-4 py-3 text-sm">
            <div className="flex justify-between items-center text-gray-600">
              <span>From: Moxie Vacation Rentals &lt;newsletter@moxievacationrentals.com&gt;</span>
              <span>📧</span>
            </div>
            <div className="font-semibold text-gray-800 mt-1">
              Subject: {subject || 'Your Eugene Newsletter'}
            </div>
            {preheader && (
              <div className="text-xs text-gray-500 mt-1">
                {preheader}
              </div>
            )}
          </div>

          {/* Newsletter Content */}
          <div 
            className={`bg-white transition-all duration-300 ${
              viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-2xl mx-auto'
            }`}
          >
            <div className="max-h-96 overflow-y-auto">
              <NewsletterTemplate
                subject={subject}
                sections={sections}
                preheader={preheader}
              />
            </div>
          </div>
        </div>

        {/* Send Test Email Section */}
        <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-gray-800">Send Test Preview</h4>
          </div>
          
          <div className="space-y-3">
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
            
            <Button 
              onClick={sendPreview}
              disabled={isSendingPreview || !previewEmail || !subject || !content}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isSendingPreview ? "Sending Preview..." : "Send Newsletter Preview"}
            </Button>
          </div>
        </div>
        
        {/* Enhanced Design Info */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Enhanced with Moxie Design</h4>
              <p className="text-sm text-gray-600 mt-1">
                Your newsletter includes branded headers, responsive design, property showcases, 
                and professional styling that reflects Moxie's Eugene-focused vacation rental expertise.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNewsletterPreview;
