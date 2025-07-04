
import React from 'react';
import EmailSetupStatus from './EmailSetupStatus';
import DomainVerificationCard from './email/DomainVerificationCard';
import EmailConfigurationCard from './email/EmailConfigurationCard';
import EmailTestingCard from './email/EmailTestingCard';

const EmailServicesTab = () => {
  return (
    <div className="space-y-8">
      {/* Email Setup Status Overview */}
      <EmailSetupStatus />

      {/* Resend Configuration */}
      <EmailConfigurationCard />

      {/* Domain Verification Status */}
      <DomainVerificationCard />

      {/* Email Testing */}
      <EmailTestingCard />
    </div>
  );
};

export default EmailServicesTab;
