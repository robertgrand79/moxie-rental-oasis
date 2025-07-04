
import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import AdminSettingsContent from '@/components/admin/settings/AdminSettingsContent';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useSettingsLocalData } from '@/hooks/useSettingsLocalData';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminSiteSettingsRedesigned = () => {
  const {
    settings,
    loading,
    error,
    saveSetting,
    saveSettings,
    updateSettingOptimistic
  } = useSimplifiedSiteSettings();

  const { localData, setLocalData } = useSettingsLocalData(settings, loading);

  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // AdminSettingsContent will reset to default state
      window.dispatchEvent(new CustomEvent('resetAdminSettings'));
    }
  });

  if (loading) {
    return (
      <AdminPageWrapper
        title="Site Settings"
        description="Configure and customize your website settings"
      >
        <div className="p-8 text-center">
          <p>Loading settings...</p>
        </div>
      </AdminPageWrapper>
    );
  }

  if (error) {
    return (
      <AdminPageWrapper
        title="Site Settings"
        description="Configure and customize your website settings"
      >
        <div className="p-8 text-center">
          <p className="text-red-600">Error loading settings: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Site Settings"
      description="Configure and customize your website settings"
    >
      <AdminSettingsContent
        localData={localData}
        setLocalData={setLocalData}
        updateSettingOptimistic={updateSettingOptimistic}
        saveSettings={saveSettings}
        saveSetting={saveSetting}
      />
    </AdminPageWrapper>
  );
};

export default AdminSiteSettingsRedesigned;
