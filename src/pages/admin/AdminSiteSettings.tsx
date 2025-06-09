
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import SettingsHeader from '@/components/admin/settings/SettingsHeader';
import SettingsTabs from '@/components/admin/settings/SettingsTabs';
import SettingsLoadingState from '@/components/admin/settings/SettingsLoadingState';
import StableBasicSettingsTab from '@/components/admin/settings/StableBasicSettingsTab';
import ContentManagementTab from '@/components/admin/settings/ContentManagementTab';
import DesignBrandingTab from '@/components/admin/settings/DesignBrandingTab';
import SEOAnalyticsTab from '@/components/admin/settings/SEOAnalyticsTab';
import EmailServicesTab from '@/components/admin/settings/EmailServicesTab';
import AIToolsTab from '@/components/admin/settings/AIToolsTab';
import AdvancedSettingsTab from '@/components/admin/settings/AdvancedSettingsTab';
import { tabs } from '@/components/admin/settings/SettingsTabsConfig';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';

const AdminSiteSettings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  
  const { settings, loading, error } = useStableSiteSettings();

  const filteredTabs = tabs.filter(tab => 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <SettingsLoadingState />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Settings</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <SettingsHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-4 -mx-6 px-6 border-b">
          <SettingsTabs tabs={tabs} filteredTabs={filteredTabs} />
        </div>

        <div className="pt-2">
          <TabsContent value="basic" className="space-y-6 mt-0">
            <StableBasicSettingsTab />
          </TabsContent>

          <TabsContent value="content" className="space-y-6 mt-0">
            <ContentManagementTab />
          </TabsContent>

          <TabsContent value="design" className="space-y-6 mt-0">
            <DesignBrandingTab />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6 mt-0">
            <SEOAnalyticsTab 
              seoData={{
                siteTitle: settings.siteTitle,
                metaDescription: settings.metaDescription,
                ogTitle: settings.ogTitle,
                ogDescription: settings.ogDescription,
                ogImage: settings.ogImage,
                favicon: settings.favicon
              }}
              setSeoData={() => {}} // This will be handled by the stable hook
              analyticsData={{
                googleAnalyticsId: settings.googleAnalyticsId,
                googleTagManagerId: settings.googleTagManagerId,
                facebookPixelId: settings.facebookPixelId,
                customHeaderScripts: settings.customHeaderScripts,
                customFooterScripts: settings.customFooterScripts,
                customCss: settings.customCss
              }}
              setAnalyticsData={() => {}} // This will be handled by the stable hook
              mapboxToken={settings.mapboxToken}
              setMapboxToken={() => {}} // This will be handled by the stable hook
              updateSetting={async () => true} // This will be handled by the stable hook
            />
          </TabsContent>

          <TabsContent value="email" className="space-y-6 mt-0">
            <EmailServicesTab />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6 mt-0">
            <AIToolsTab siteData={settings} setSiteData={() => {}} />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-0">
            <AdvancedSettingsTab 
              analyticsData={{
                googleAnalyticsId: settings.googleAnalyticsId,
                googleTagManagerId: settings.googleTagManagerId,
                facebookPixelId: settings.facebookPixelId,
                customHeaderScripts: settings.customHeaderScripts,
                customFooterScripts: settings.customFooterScripts,
                customCss: settings.customCss
              }}
              setAnalyticsData={() => {}} // This will be handled by the stable hook
              updateSetting={async () => true} // This will be handled by the stable hook
            />
          </TabsContent>
        </div>
      </Tabs>
    </SettingsHeader>
  );
};

export default AdminSiteSettings;
