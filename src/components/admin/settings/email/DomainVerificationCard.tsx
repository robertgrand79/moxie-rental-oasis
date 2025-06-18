
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Shield, Globe, ExternalLink } from 'lucide-react';

const DomainVerificationCard = () => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          Domain Verification Status
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Verify your moxievacationrentals.com domain in SendGrid for proper email delivery
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Globe className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-2">Domain: moxievacationrentals.com</p>
              <p className="text-blue-700 mb-3">
                To send emails from your domain, you must verify it in SendGrid. This ensures high deliverability and prevents your emails from being marked as spam.
              </p>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">Verification Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Go to SendGrid → Settings → Sender Authentication</li>
                  <li>Click "Verify a Single Sender" or "Authenticate Your Domain"</li>
                  <li>Enter moxievacationrentals.com as your domain</li>
                  <li>Add the provided DNS records to your domain</li>
                  <li>Wait for verification (can take up to 48 hours)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://app.sendgrid.com/settings/sender_auth', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Verify Domain in SendGrid
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Domain Setup Guide
          </Button>
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default DomainVerificationCard;
