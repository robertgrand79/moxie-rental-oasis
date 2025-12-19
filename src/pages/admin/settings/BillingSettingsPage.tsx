import React from 'react';
import { CreditCard } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import BillingSubscriptionTab from '@/components/admin/organization/BillingSubscriptionTab';

const BillingSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="Billing & Subscription" 
      description="Manage your subscription and billing"
      icon={CreditCard}
    >
      <BillingSubscriptionTab />
    </SettingsSidebarLayout>
  );
};

export default BillingSettingsPage;
