
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, Image } from 'lucide-react';
import ColorCustomizer from '@/components/ColorCustomizer';
import FontCustomizer from '@/components/FontCustomizer';
import LogoUploader from '@/components/LogoUploader';

const DesignBrandingTab = () => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle>Design & Branding</EnhancedCardTitle>
        <EnhancedCardDescription>
          Customize your site's visual appearance and branding elements
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Colors</span>
            </TabsTrigger>
            <TabsTrigger value="fonts" className="flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span>Typography</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>Logo & Images</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors">
            <ColorCustomizer />
          </TabsContent>

          <TabsContent value="fonts">
            <FontCustomizer />
          </TabsContent>

          <TabsContent value="branding">
            <LogoUploader />
          </TabsContent>
        </Tabs>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default DesignBrandingTab;
