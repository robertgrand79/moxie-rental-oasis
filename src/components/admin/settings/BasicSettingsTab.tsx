
import React from 'react';
import SettingsErrorBoundary from './SettingsErrorBoundary';
import StableBasicSettingsTab from './StableBasicSettingsTab';

interface BasicSettingsTabProps {
  siteData?: any;
  setSiteData?: (data: any) => void;
  updateSetting?: (key: string, value: any) => Promise<boolean>;
  isUserEditing?: boolean;
}

const BasicSettingsTab = ({ siteData, setSiteData, updateSetting, isUserEditing }: BasicSettingsTabProps) => {
  return (
    <SettingsErrorBoundary>
      <StableBasicSettingsTab />
    </SettingsErrorBoundary>
  );
};

export default BasicSettingsTab;
