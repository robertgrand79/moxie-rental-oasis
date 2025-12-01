import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { PriceLabsSettings } from '@/components/admin/settings/PriceLabsSettings';
import { DollarSign } from 'lucide-react';

const AdminPriceLabs = () => {
  return (
    <AdminPageWrapper
      title="PriceLabs Integration"
      description="Manage PriceLabs property mappings and sync dynamic pricing"
    >
      <div className="space-y-6">
        <PriceLabsSettings />
      </div>
    </AdminPageWrapper>
  );
};

export default AdminPriceLabs;
