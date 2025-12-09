import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import PaymentsSettingsPanel from '@/components/admin/settings-hub/PaymentsSettingsPanel';

const PaymentsSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Payments Settings" description="Manage your payment settings">
      <SettingsPageLayout
        title="Payments"
        description="Stripe configuration, PriceLabs pricing"
      >
        <PaymentsSettingsPanel />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default PaymentsSettingsPage;
