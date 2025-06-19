
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';

const DomainVerificationCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Domain Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Domain verification required for reliable email delivery</strong>
            <br />
            <span className="text-sm">
              To ensure your newsletters reach subscribers' inboxes (not spam), you need to verify your sending domain in SendGrid.
            </span>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-medium">Steps to verify your domain:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Go to SendGrid's Domain Authentication</li>
            <li>Add your domain (e.g., yourdomain.com)</li>
            <li>Add the provided DNS records to your domain</li>
            <li>Verify the domain in SendGrid</li>
            <li>Use a verified email address for sending</li>
          </ol>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('https://app.sendgrid.com/settings/sender_auth/domain', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            SendGrid Domain Auth
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Setup Guide
          </Button>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>💡 Pro Tip:</strong> Once your domain is verified, your emails will have better deliverability and won't be marked as spam as often.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DomainVerificationCard;
