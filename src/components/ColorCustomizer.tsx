import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Palette, RotateCcw, Save, Eye, Loader2 } from 'lucide-react';
import AIPaletteGenerator from '@/components/admin/settings/AIPaletteGenerator';
import SiteThemePreview from '@/components/admin/settings/SiteThemePreview';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

const defaultColors: ColorPalette = {
  primary: '#767b8d',
  secondary: '#8b929a',
  accent: '#cbcfd2',
  background: '#ffffff',
  text: '#1a202c',
  muted: '#ececec',
};

/**
 * Convert hex color to HSL string for CSS custom properties
 */
const hexToHsl = (hex: string): string => {
  if (!hex || !hex.startsWith('#') || hex.length < 7) {
    return '0 0% 50%';
  }

  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const ColorCustomizer = () => {
  const { settings, loading: settingsLoading, saveSettings, saving } = useSimplifiedSiteSettings();
  const [colors, setColors] = useState<ColorPalette>(defaultColors);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const { toast } = useToast();

  // Load colors from database settings
  useEffect(() => {
    if (settingsLoading) return;
    
    const loadedColors: ColorPalette = {
      primary: settings?.colorPrimary || defaultColors.primary,
      secondary: settings?.colorSecondary || defaultColors.secondary,
      accent: settings?.colorAccent || defaultColors.accent,
      background: settings?.colorBackground || defaultColors.background,
      text: settings?.colorForeground || defaultColors.text,
      muted: settings?.colorMuted || defaultColors.muted,
    };
    
    setColors(loadedColors);
    console.log('🎨 [ColorCustomizer] Loaded colors from settings:', loadedColors);
  }, [settings, settingsLoading]);

  const handleColorChange = (colorKey: string, value: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
    setHasChanges(true);
    
    // Apply immediately to preview
    applyColorsToDOM({ ...colors, [colorKey]: value });
  };

  const applyColorsToDOM = (colorsToApply: ColorPalette) => {
    const root = document.documentElement;
    
    const primaryHsl = hexToHsl(colorsToApply.primary);
    const secondaryHsl = hexToHsl(colorsToApply.secondary);
    const accentHsl = hexToHsl(colorsToApply.accent);
    const backgroundHsl = hexToHsl(colorsToApply.background);
    const foregroundHsl = hexToHsl(colorsToApply.text);
    const mutedHsl = hexToHsl(colorsToApply.muted);

    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--background', backgroundHsl);
    root.style.setProperty('--foreground', foregroundHsl);
    root.style.setProperty('--muted', mutedHsl);
    root.style.setProperty('--card', backgroundHsl);
    root.style.setProperty('--card-foreground', foregroundHsl);
    root.style.setProperty('--popover', backgroundHsl);
    root.style.setProperty('--popover-foreground', foregroundHsl);
    root.style.setProperty('--gradient-from', primaryHsl);
    root.style.setProperty('--gradient-via', secondaryHsl);
    root.style.setProperty('--gradient-to', accentHsl);
    root.style.setProperty('--gradient-accent-from', secondaryHsl);
    root.style.setProperty('--gradient-accent-to', accentHsl);
    root.style.setProperty('--hero-gradient-from', primaryHsl);
    root.style.setProperty('--hero-gradient-to', secondaryHsl);
    root.style.setProperty('--footer-bg', primaryHsl);
  };

  const saveColors = async () => {
    const success = await saveSettings({
      colorPrimary: colors.primary,
      colorSecondary: colors.secondary,
      colorAccent: colors.accent,
      colorBackground: colors.background,
      colorForeground: colors.text,
      colorMuted: colors.muted,
    });

    if (success) {
      setHasChanges(false);
      toast({
        title: "Colors Saved",
        description: "Your custom colors have been saved to the database.",
      });
    }
  };

  const resetColors = async () => {
    setColors(defaultColors);
    
    // Remove CSS variable overrides
    const root = document.documentElement;
    const propsToRemove = [
      '--primary', '--secondary', '--accent', '--background', '--foreground', '--muted',
      '--card', '--card-foreground', '--popover', '--popover-foreground',
      '--gradient-from', '--gradient-via', '--gradient-to', '--gradient-accent-from', '--gradient-accent-to',
      '--hero-gradient-from', '--hero-gradient-to', '--footer-bg'
    ];
    propsToRemove.forEach(prop => root.style.removeProperty(prop));

    // Save empty values to database to reset
    const success = await saveSettings({
      colorPrimary: '',
      colorSecondary: '',
      colorAccent: '',
      colorBackground: '',
      colorForeground: '',
      colorMuted: '',
    });

    if (success) {
      setHasChanges(false);
      toast({
        title: "Colors Reset",
        description: "Colors have been reset to default values.",
      });
    }
  };

  const colorPresets = [
    { 
      name: 'Gray Palette', 
      colors: { 
        primary: '#767b8d', 
        secondary: '#8b929a', 
        accent: '#cbcfd2',
        background: '#ffffff',
        text: '#1a202c',
        muted: '#ececec'
      } 
    },
    { name: 'Ocean Blue', colors: { primary: '#0077be', secondary: '#00a8cc', accent: '#00d4aa', background: '#ffffff', text: '#1a202c', muted: '#e0f4ff' } },
    { name: 'Sunset Orange', colors: { primary: '#ff6b35', secondary: '#f7931e', accent: '#ffcc02', background: '#ffffff', text: '#1a202c', muted: '#fff4e6' } },
    { name: 'Forest Green', colors: { primary: '#2d5016', secondary: '#4a7c59', accent: '#87a96b', background: '#ffffff', text: '#1a202c', muted: '#e8f5e8' } },
    { name: 'Royal Purple', colors: { primary: '#5d2e5d', secondary: '#8e44ad', accent: '#c39bd3', background: '#ffffff', text: '#1a202c', muted: '#f5e6f5' } },
  ];

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setColors(preset.colors);
    setHasChanges(true);
    applyColorsToDOM(preset.colors);
  };

  const handleApplyAIPalette = (palette: ColorPalette) => {
    setColors(palette);
    setHasChanges(true);
    applyColorsToDOM(palette);
  };

  const isSaving = Object.values(saving).some(Boolean);

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading colors...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <AIPaletteGenerator onApplyPalette={handleApplyAIPalette} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Color Customization
            </CardTitle>
            <CardDescription>
              Customize your site's color scheme. Changes are saved to the database and apply globally.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={key}
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={saveColors} className="flex-1" disabled={isSaving || !hasChanges}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {hasChanges ? 'Save Colors' : 'No Changes'}
              </Button>
              <Button onClick={resetColors} variant="outline" disabled={isSaving}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color Presets</CardTitle>
            <CardDescription>
              Quick color schemes to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {colorPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  onClick={() => applyPreset(preset)}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <div className="flex space-x-1">
                    {[preset.colors.primary, preset.colors.secondary, preset.colors.accent].map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-sm">{preset.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Live Preview */}
      <div className="xl:col-span-1">
        <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-base">
                  <Eye className="h-4 w-4 mr-2" />
                  Live Preview
                </CardTitle>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {previewOpen ? 'Collapse' : 'Expand'}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CardDescription className="text-xs">
                See how your colors look on the site
              </CardDescription>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-2">
                <SiteThemePreview />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
};

export default ColorCustomizer;
