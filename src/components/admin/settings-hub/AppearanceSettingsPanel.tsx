import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, Image } from 'lucide-react';
import ColorCustomizer from '@/components/ColorCustomizer';
import FontCustomizer from '@/components/FontCustomizer';
import LogoUploader from '@/components/LogoUploader';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';

const AppearanceSettingsPanel = () => {
  const { saveSetting } = useStableSiteSettings();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="colors" className="w-full">
        <TabsList>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="fonts" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Fonts
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize your site's color palette</CardDescription>
            </CardHeader>
            <CardContent>
              <ColorCustomizer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fonts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Choose fonts for your site</CardDescription>
            </CardHeader>
            <CardContent>
              <FontCustomizer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo & Favicon</CardTitle>
                <CardDescription>Upload your brand assets</CardDescription>
              </CardHeader>
              <CardContent>
                <LogoUploader />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppearanceSettingsPanel;
