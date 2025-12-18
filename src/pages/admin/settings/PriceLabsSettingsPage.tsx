import React from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { PriceLabsSettings } from '@/components/admin/settings/PriceLabsSettings';

const PriceLabsSettingsPage = () => {
  return (
    <SettingsSidebarLayout title="PriceLabs" description="Configure dynamic pricing">
      <PriceLabsSettings />
    </SettingsSidebarLayout>
  );
};

export default PriceLabsSettingsPage;
