
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSettingsData } from '@/hooks/useSettingsData';
import SettingsHeader from '@/components/admin/settings/SettingsHeader';
import SettingsTabs from '@/components/admin/settings/SettingsTabs';
import SettingsLoadingState from '@/components/admin/settings/SettingsLoadingState';
import BasicSettingsTab from '@/components/admin/settings/BasicSettingsTab';
import ContentManagementTab from '@/components/admin/settings/ContentManagementTab';
import DesignBrandingTab from '@/components/admin/settings/DesignBrandingTab';
import SEOAnalyticsTab from '@/components/admin/settings/SEOAnalyticsTab';
import AIToolsTab from '@/components/admin/settings/AIToolsTab';
import AdvancedSettingsTab from '@/components/admin/settings/AdvancedSettingsTab';
import { tabs } from '@/components/admin/settings/SettingsTabsConfig';

const AdminSiteSettings = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  
  const {
    siteData,
    setSiteData,
    mapboxToken,
    setMapboxToken,
    seoData,
    setSeoData,
    analyticsData,
    setAnalyticsData,
    updateSetting,
    loading
  } = useSettingsData();

  const filteredTabs = tabs.filter(tab => 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <SettingsLoadingState />;
  }

  return (
    <SettingsHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <SettingsTabs tabs={tabs} filteredTabs={filteredTabs} />

        <TabsContent value="basic" className="space-y-6">
          <BasicSettingsTab 
            siteData={siteData}
            setSiteData={setSiteData}
            updateSetting={updateSetting}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentManagementTab />
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <DesignBrandingTab />
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <SEOAnalyticsTab 
            seoData={seoData}
            setSeoData={setSeoData}
            analyticsData={analyticsData}
            setAnalyticsData={setAnalyticsData}
            mapboxToken={mapboxToken}
            setMapboxToken={setMapboxToken}
            updateSetting={updateSetting}
          />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AIToolsTab siteData={siteData} setSiteData={setSiteData} />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedSettingsTab 
            analyticsData={analyticsData}
            setAnalyticsData={setAnalyticsData}
            updateSetting={updateSetting}
          />
        </TabsContent>
      </Tabs>
    </SettingsHeader>
  );
};

export default AdminSiteSettings;
