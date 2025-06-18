
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface EmailConfigurationChecklistProps {
  emailSetupVerified: boolean;
}

const EmailConfigurationChecklist = ({ emailSetupVerified }: EmailConfigurationChecklistProps) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-2">Configuration Checklist:</h4>
      <ul className="space-y-2 text-sm text-gray-700">
        <li className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          SendGrid account created
        </li>
        <li className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          API key generated and added to secrets
        </li>
        <li className="flex items-center">
          {emailSetupVerified ? (
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
          )}
          Domain moxievacationrentals.com verified in SendGrid
        </li>
        <li className="flex items-center">
          {emailSetupVerified ? (
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
          )}
          Test email sent successfully from verified domain
        </li>
      </ul>
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <p className="text-yellow-800">
          <strong>Important:</strong> Emails will only be delivered reliably once your domain is verified in SendGrid. 
          Unverified domains may result in emails being blocked or marked as spam.
        </p>
      </div>
    </div>
  );
};

export default EmailConfigurationChecklist;
