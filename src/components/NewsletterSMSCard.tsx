
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Send, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Smartphone
} from 'lucide-react';
import { useNewsletterSMS } from '@/hooks/useNewsletterSMS';
import { useNewsletterStats } from '@/hooks/useNewsletterStats';

const NewsletterSMSCard = () => {
  const [smsMessage, setSmsMessage] = useState('');
  const { sendNewsletterSMS, isLoading } = useNewsletterSMS();
  const { smsSubscriberCount } = useNewsletterStats();

  const handleSendSMS = async () => {
    if (!smsMessage.trim()) {
      return;
    }

    await sendNewsletterSMS(smsMessage);
    setSmsMessage('');
  };

  const maxLength = 160;
  const remainingChars = maxLength - smsMessage.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          Send SMS Newsletter
        </CardTitle>
        <CardDescription>
          Send SMS updates to subscribers who have opted into text notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SMS Subscriber Count */}
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <Smartphone className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">
            <strong>{smsSubscriberCount || 0}</strong> subscribers have opted into SMS updates
          </span>
        </div>

        {/* SMS Message Input */}
        <div className="space-y-2">
          <label htmlFor="sms-message" className="text-sm font-medium">
            SMS Message
          </label>
          <Textarea
            id="sms-message"
            placeholder="Type your SMS message here..."
            value={smsMessage}
            onChange={(e) => setSmsMessage(e.target.value)}
            className="min-h-[100px]"
            maxLength={maxLength}
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Keep it concise for better engagement</span>
            <span className={remainingChars < 20 ? 'text-orange-600' : ''}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSendSMS}
          disabled={isLoading || !smsMessage.trim() || !smsSubscriberCount}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? "Sending SMS..." : `Send SMS to ${smsSubscriberCount || 0} Subscribers`}
        </Button>

        {/* Information */}
        <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Messages are personalized with subscriber names when available</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-500" />
            <span>Powered by QUO for reliable delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span>Only sent to subscribers who have opted into SMS notifications</span>
          </div>
        </div>

        {!smsSubscriberCount && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              No subscribers have opted into SMS updates yet. Encourage visitors to enable SMS notifications when subscribing to your newsletter.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsletterSMSCard;
