import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette } from 'lucide-react';
import NewsletterHeaderEditor from './NewsletterHeaderEditor';
import NewsletterFooterEditor from './NewsletterFooterEditor';
import { useGlobalNewsletterSettings } from '@/hooks/useGlobalNewsletterSettings';
import { Skeleton } from '@/components/ui/skeleton';

const GlobalNewsletterSettings = () => {
  const { 
    settings, 
    loading, 
    saving, 
    updateHeaderConfig, 
    updateFooterConfig 
  } = useGlobalNewsletterSettings();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Brand Settings</CardTitle>
          <CardDescription>Configure the global header and footer for all newsletters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Newsletter Brand Settings
        </CardTitle>
        <CardDescription>
          Configure the global header and footer that will be used across all newsletters. 
          These settings ensure consistent branding for your email campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="header" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="header" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Header Configuration
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Footer Configuration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="header">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Newsletter Header</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Configure the header that appears at the top of every newsletter, including your logo, 
                company name, tagline, and brand colors.
              </p>
              <NewsletterHeaderEditor
                headerConfig={settings.headerConfig}
                onHeaderConfigChange={updateHeaderConfig}
                disabled={saving}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="footer">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Newsletter Footer</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Configure the footer that appears at the bottom of every newsletter, including 
                contact information, links, and social media handles.
              </p>
              <NewsletterFooterEditor
                footerConfig={settings.footerConfig}
                onFooterConfigChange={updateFooterConfig}
                disabled={saving}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GlobalNewsletterSettings;