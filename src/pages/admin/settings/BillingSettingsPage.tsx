import React from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import BillingSubscriptionTab from '@/components/admin/organization/BillingSubscriptionTab';

const BillingSettingsPage = () => {
  return (
    <SettingsSidebarLayout title="Billing & Subscription" description="Manage your subscription and billing">
      <BillingSubscriptionTab />
    </SettingsSidebarLayout>
  );
};

export default BillingSettingsPage;
