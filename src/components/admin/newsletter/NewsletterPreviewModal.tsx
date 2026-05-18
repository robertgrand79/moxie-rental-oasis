import React from 'react';
import { Calendar, Users, Mail, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SecureContentRenderer from '@/components/SecureContentRenderer';
import { NewsletterCampaign, NewsletterPreviewModalProps } from './types';

const NewsletterPreviewModal = ({ campaign, open, onClose }: NewsletterPreviewModalProps) => {
  if (!campaign) return null;

  // Flag newsletters whose body smuggles inline base64 images. Those are the
  // shape of the May 2026 silent-send failure — Resend rejects oversize bodies
  // and the send-newsletter v450 guard now blocks them up front. Surface this
  // in preview so the admin understands why the email won't actually send and
  // can duplicate-and-fix instead of guessing.
  const hasInlineImage = /data:image\/[a-z0-9+]+;base64/i.test(campaign.content || '');
  const contentSizeKB = Math.round((campaign.content?.length || 0) / 1024);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Newsletter Preview</DialogTitle>
          <DialogDescription>
            Preview the newsletter content and details before sending
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Campaign Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">{campaign.subject}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  {campaign.sent_at 
                    ? `Sent: ${new Date(campaign.sent_at).toLocaleDateString()}`
                    : 'Draft'
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{campaign.recipient_count} recipients</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Badge variant={campaign.sent_at ? "default" : "secondary"}>
                  {campaign.sent_at ? "Sent" : "Draft"}
                </Badge>
              </div>
            </div>
          </div>

          {hasInlineImage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>This newsletter contains an inline base64 image ({contentSizeKB} KB body)</AlertTitle>
              <AlertDescription>
                Email providers reject bodies this large, so a new send of this exact content
                will fail. To fix: Duplicate this campaign, delete the inline image in the
                editor, and re-insert it via the toolbar's image-URL picker (which uploads to
                hosted storage). The preview below shows the image inline only because we
                allow base64 in preview rendering specifically.
              </AlertDescription>
            </Alert>
          )}

          {/* Newsletter Content */}
          <div className="border rounded-lg p-6 bg-white">
            <h4 className="font-medium mb-4 text-gray-700">Newsletter Content:</h4>
            <div className="prose prose-sm max-w-none">
              <SecureContentRenderer
                content={campaign.content}
                className="newsletter-preview-content"
                richContent
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPreviewModal;
