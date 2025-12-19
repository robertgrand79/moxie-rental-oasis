import React from 'react';
import { DollarSign } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import PaymentsSettingsPanel from '@/components/admin/settings-hub/PaymentsSettingsPanel';

const PaymentsSettingsPage: React.FC = () => {
  return (
    <SettingsSidebarLayout 
      title="Payments" 
      description="Stripe configuration, PriceLabs pricing"
      icon={DollarSign}
    >
      <PaymentsSettingsPanel />
    </SettingsSidebarLayout>
  );
};

export default PaymentsSettingsPage;
