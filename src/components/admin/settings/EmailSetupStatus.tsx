
import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';

const EmailSetupStatus = () => {
  const { settings } = useStableSiteSettings();
  
  const emailSetupVerified = settings.emailSetupVerified === 'true' || settings.emailSetupVerified === true;
  const emailLastTestedAt = settings.emailLastTestedAt && settings.emailLastTestedAt !== 'null' ? settings.emailLastTestedAt : null;
  
  let emailVerificationDetails = {};
  try {
    emailVerificationDetails = typeof settings.emailVerificationDetails === 'string' 
      ? JSON.parse(settings.emailVerificationDetails) 
      : settings.emailVerificationDetails || {};
  } catch (e) {
    emailVerificationDetails = {};
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${
      emailSetupVerified 
        ? 'border-green-200 bg-green-50' 
        : 'border-yellow-200 bg-yellow-50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Email Setup</span>
        {emailSetupVerified ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-yellow-600" />
        )}
      </div>
      
      <p className={`text-sm mb-2 ${
        emailSetupVerified ? 'text-green-700' : 'text-yellow-700'
      }`}>
        {emailSetupVerified 
          ? 'Email configuration verified and ready'
          : 'Email configuration needs verification'
        }
      </p>
      
      {emailSetupVerified && emailLastTestedAt && (
        <div className="flex items-center text-xs text-green-600">
          <Clock className="h-3 w-3 mr-1" />
          <span>Last verified: {new Date(emailLastTestedAt).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
};

export default EmailSetupStatus;
