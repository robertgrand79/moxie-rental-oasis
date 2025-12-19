import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Type, ImageIcon, RefreshCw, CheckCircle2, Pencil } from 'lucide-react';
import ColorsSettingsDrawer from './drawers/ColorsSettingsDrawer';
import FontsSettingsDrawer from './drawers/FontsSettingsDrawer';
import BrandingSettingsDrawer from './drawers/BrandingSettingsDrawer';

const ModernAppearanceSettings: React.FC = () => {
  const [colorsDrawerOpen, setColorsDrawerOpen] = useState(false);
  const [fontsDrawerOpen, setFontsDrawerOpen] = useState(false);
  const [brandingDrawerOpen, setBrandingDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Palette className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
            <p className="text-muted-foreground">Customize your site's look and feel</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group" onClick={() => setColorsDrawerOpen(true)}>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-xl bg-muted inline-block mb-3 group-hover:bg-primary/10">
              <Palette className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium">Colors</h3>
            <p className="text-sm text-muted-foreground">Color palette</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group" onClick={() => setFontsDrawerOpen(true)}>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-xl bg-muted inline-block mb-3 group-hover:bg-primary/10">
              <Type className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium">Fonts</h3>
            <p className="text-sm text-muted-foreground">Typography</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group" onClick={() => setBrandingDrawerOpen(true)}>
          <CardContent className="p-6 text-center">
            <div className="p-3 rounded-xl bg-muted inline-block mb-3 group-hover:bg-primary/10">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium">Branding</h3>
            <p className="text-sm text-muted-foreground">Logo & favicon</p>
          </CardContent>
        </Card>
      </div>

      <ColorsSettingsDrawer open={colorsDrawerOpen} onOpenChange={setColorsDrawerOpen} />
      <FontsSettingsDrawer open={fontsDrawerOpen} onOpenChange={setFontsDrawerOpen} />
      <BrandingSettingsDrawer open={brandingDrawerOpen} onOpenChange={setBrandingDrawerOpen} />
    </div>
  );
};

export default ModernAppearanceSettings;
