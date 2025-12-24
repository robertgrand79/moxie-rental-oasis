import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BarChart3, Share } from 'lucide-react';
import SEOSettingsTab from './SEOSettingsTab';
import AnalyticsSettingsTab from './AnalyticsSettingsTab';
import SocialSettingsTab from './SocialSettingsTab';
import { SEOData, AnalyticsData, SettingValue } from '@/types/settings';

interface SEOAnalyticsTabProps {
  seoData: SEOData;
  setSeoData: (data: SEOData) => void;
  analyticsData: AnalyticsData;
  setAnalyticsData: (data: AnalyticsData) => void;
  updateSetting: (key: string, value: SettingValue) => Promise<boolean>;
}

const SEOAnalyticsTab = ({ 
  seoData, 
  setSeoData, 
  analyticsData, 
  setAnalyticsData, 
  updateSetting 
}: SEOAnalyticsTabProps) => {
  const handleSaveSeoSettings = async () => {
    const settingsToSave = [
      { key: 'siteTitle', value: seoData.siteTitle },
      { key: 'metaDescription', value: seoData.metaDescription },
      { key: 'ogTitle', value: seoData.ogTitle },
      { key: 'ogDescription', value: seoData.ogDescription },
      { key: 'ogImage', value: seoData.ogImage },
      { key: 'favicon', value: seoData.favicon },
    ];

    let allSuccessful = true;
    for (const setting of settingsToSave) {
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
      }
    }
    return allSuccessful;
  };

  const handleSaveAnalyticsSettings = async () => {
    const settingsToSave = [
      { key: 'googleAnalyticsId', value: analyticsData.googleAnalyticsId },
      { key: 'googleTagManagerId', value: analyticsData.googleTagManagerId },
      { key: 'facebookPixelId', value: analyticsData.facebookPixelId },
      { key: 'customHeaderScripts', value: analyticsData.customHeaderScripts },
      { key: 'customFooterScripts', value: analyticsData.customFooterScripts },
      { key: 'customCss', value: analyticsData.customCss },
    ];

    let allSuccessful = true;
    for (const setting of settingsToSave) {
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
      }
    }
    return allSuccessful;
  };

  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle>SEO & Analytics</EnhancedCardTitle>
        <EnhancedCardDescription>
          Configure search engine optimization, analytics tracking, and integrations
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <Tabs defaultValue="seo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="seo" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>SEO</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-2">
              <Share className="h-4 w-4" />
              <span>Social</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seo">
            <SEOSettingsTab />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsSettingsTab
              analyticsData={analyticsData}
              setAnalyticsData={setAnalyticsData}
              onSave={handleSaveAnalyticsSettings}
            />
          </TabsContent>

          <TabsContent value="social">
            <div className="p-4 bg-blue-50 rounded-lg border">
              <p className="text-sm text-blue-800">
                Social media settings are configured in the Basic Settings tab under Contact Information.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default SEOAnalyticsTab;
