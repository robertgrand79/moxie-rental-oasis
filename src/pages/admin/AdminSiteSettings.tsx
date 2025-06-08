
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-4 -mx-6 px-6 border-b">
          <SettingsTabs tabs={tabs} filteredTabs={filteredTabs} />
        </div>

        <div className="pt-2">
          <TabsContent value="basic" className="space-y-6 mt-0">
            <BasicSettingsTab 
              siteData={siteData}
              setSiteData={setSiteData}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="content" className="space-y-6 mt-0">
            <ContentManagementTab />
          </TabsContent>

          <TabsContent value="design" className="space-y-6 mt-0">
            <DesignBrandingTab />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6 mt-0">
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

          <TabsContent value="ai" className="space-y-6 mt-0">
            <AIToolsTab siteData={siteData} setSiteData={setSiteData} />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-0">
            <AdvancedSettingsTab 
              analyticsData={analyticsData}
              setAnalyticsData={setAnalyticsData}
              updateSetting={updateSetting}
            />
          </TabsContent>
        </div>
      </Tabs>
    </SettingsHeader>
  );
};

export default AdminSiteSettings;
