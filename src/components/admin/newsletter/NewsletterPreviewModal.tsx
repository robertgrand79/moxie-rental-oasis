
import React from 'react';
import { X, Calendar, Users, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SecureContentRenderer from '@/components/SecureContentRenderer';

interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  sent_at: string | null;
  recipient_count: number;
  blog_post_id: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsletterPreviewModalProps {
  campaign: NewsletterCampaign | null;
  open: boolean;
  onClose: () => void;
}

const NewsletterPreviewModal = ({ campaign, open, onClose }: NewsletterPreviewModalProps) => {
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Newsletter Preview
          </DialogTitle>
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

          {/* Newsletter Content */}
          <div className="border rounded-lg p-6 bg-white">
            <h4 className="font-medium mb-4 text-gray-700">Newsletter Content:</h4>
            <div className="prose prose-sm max-w-none">
              <SecureContentRenderer 
                content={campaign.content}
                className="newsletter-preview-content"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPreviewModal;
