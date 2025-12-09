import React from 'react';
import AdminSettingsContent from '@/components/admin/settings/AdminSettingsContent';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useSettingsLocalData } from '@/hooks/useSettingsLocalData';

const SiteContentSettingsPanel = () => {
  const {
    settings,
    loading,
    error,
    saveSetting,
    saveSettings,
    updateSettingOptimistic
  } = useSimplifiedSiteSettings();

  const { localData, setLocalData } = useSettingsLocalData(settings, loading);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading settings: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AdminSettingsContent
      localData={localData}
      setLocalData={setLocalData}
      updateSettingOptimistic={updateSettingOptimistic}
      saveSettings={saveSettings}
      saveSetting={saveSetting}
    />
  );
};

export default SiteContentSettingsPanel;
