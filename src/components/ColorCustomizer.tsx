/**
 * Color Customizer Component
 * 
 * Admin interface for customizing the site's color scheme.
 * Provides real-time preview, preset palettes, and AI-generated suggestions.
 * Changes are persisted to the database and applied globally via useGlobalColors.
 * 
 * @module ColorCustomizer
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Palette, RotateCcw, Save, Eye, Loader2 } from 'lucide-react';
import AIPaletteGenerator from '@/components/admin/settings/AIPaletteGenerator';
import SiteThemePreview from '@/components/admin/settings/SiteThemePreview';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { 
  hexToHsl, 
  applyColorsToDOM, 
  resetColorsInDOM, 
  DEFAULT_COLORS,
  type ColorPalette 
} from '@/lib/colorUtils';

/**
 * Default color palette matching the site's default theme.
 */
const defaultColors: ColorPalette = {
  primary: DEFAULT_COLORS.primary,
  secondary: DEFAULT_COLORS.secondary,
  accent: DEFAULT_COLORS.accent,
  background: DEFAULT_COLORS.background,
  text: DEFAULT_COLORS.foreground,
  muted: DEFAULT_COLORS.muted,
  destructive: DEFAULT_COLORS.destructive,
};

/**
 * ColorCustomizer provides an admin interface for site color customization.
 * 
 * Features:
 * - Live preview of color changes
 * - Preset color palettes for quick selection
 * - AI-powered palette generation
 * - Persistence to database via useSimplifiedSiteSettings
 * - Real-time CSS variable updates for instant feedback
 */
const ColorCustomizer = () => {
  const { settings, loading: settingsLoading, saveSettings, saving } = useSimplifiedSiteSettings();
  const [colors, setColors] = useState<ColorPalette>(defaultColors);
  const [useGradients, setUseGradients] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const { toast } = useToast();

  // Load colors from database settings on mount
  useEffect(() => {
    if (settingsLoading) return;
    
    const loadedColors: ColorPalette = {
      primary: settings?.colorPrimary || defaultColors.primary,
      secondary: settings?.colorSecondary || defaultColors.secondary,
      accent: settings?.colorAccent || defaultColors.accent,
      background: settings?.colorBackground || defaultColors.background,
      text: settings?.colorForeground || defaultColors.text,
      muted: settings?.colorMuted || defaultColors.muted,
      destructive: settings?.colorDestructive || defaultColors.destructive,
    };
    
    setColors(loadedColors);
    setUseGradients(settings?.colorUseGradients !== false);
    console.log('🎨 [ColorCustomizer] Loaded colors from settings:', loadedColors);
  }, [settings, settingsLoading]);

  /**
   * Handles color input changes with immediate DOM preview.
   */
  const handleColorChange = (colorKey: string, value: string) => {
    const newColors = { ...colors, [colorKey]: value };
    setColors(newColors);
    setHasChanges(true);
    
    // Apply immediately to DOM for live preview
    applyColorsToDOM(newColors, useGradients);
  };

  /**
   * Handles gradient toggle change with immediate DOM preview.
   */
  const handleGradientToggle = (enabled: boolean) => {
    setUseGradients(enabled);
    setHasChanges(true);
    // Apply immediately to DOM for live preview
    applyColorsToDOM(colors, enabled);
  };

  /**
   * Saves current color palette to the database.
   */
  const saveColors = async () => {
    const success = await saveSettings({
      colorPrimary: colors.primary,
      colorSecondary: colors.secondary,
      colorAccent: colors.accent,
      colorBackground: colors.background,
      colorForeground: colors.text,
      colorMuted: colors.muted,
      colorDestructive: colors.destructive,
      colorUseGradients: useGradients,
    });

    if (success) {
      setHasChanges(false);
      toast({
        title: "Colors Saved",
        description: "Your custom colors have been saved to the database.",
      });
    }
  };

  /**
   * Resets colors to default values and clears database overrides.
   */
  const resetColors = async () => {
    setColors(defaultColors);
    
    // Remove CSS variable overrides to use defaults from index.css
    resetColorsInDOM();

    setUseGradients(true);

    // Save empty values to database to clear custom colors
    const success = await saveSettings({
      colorPrimary: '',
      colorSecondary: '',
      colorAccent: '',
      colorBackground: '',
      colorForeground: '',
      colorMuted: '',
      colorDestructive: '',
      colorUseGradients: true,
    });

    if (success) {
      setHasChanges(false);
      toast({
        title: "Colors Reset",
        description: "Colors have been reset to default values.",
      });
    }
  };

  /**
   * Preset color palettes for quick selection.
   */
  const colorPresets = [
    { 
      name: 'Gray Palette', 
      colors: { 
        primary: '#767b8d', 
        secondary: '#8b929a', 
        accent: '#cbcfd2',
        background: '#ffffff',
        text: '#1a202c',
        muted: '#ececec',
        destructive: '#ef4444'
      } 
    },
    { name: 'Ocean Blue', colors: { primary: '#0077be', secondary: '#00a8cc', accent: '#00d4aa', background: '#ffffff', text: '#1a202c', muted: '#e0f4ff', destructive: '#ef4444' } },
    { name: 'Sunset Orange', colors: { primary: '#ff6b35', secondary: '#f7931e', accent: '#ffcc02', background: '#ffffff', text: '#1a202c', muted: '#fff4e6', destructive: '#dc2626' } },
    { name: 'Forest Green', colors: { primary: '#2d5016', secondary: '#4a7c59', accent: '#87a96b', background: '#ffffff', text: '#1a202c', muted: '#e8f5e8', destructive: '#ef4444' } },
    { name: 'Royal Purple', colors: { primary: '#5d2e5d', secondary: '#8e44ad', accent: '#c39bd3', background: '#ffffff', text: '#1a202c', muted: '#f5e6f5', destructive: '#ef4444' } },
  ];

  /**
   * Applies a preset color palette.
   */
  const applyPreset = (preset: typeof colorPresets[0]) => {
    setColors(preset.colors);
    setHasChanges(true);
    applyColorsToDOM(preset.colors, useGradients);
  };

  /**
   * Handles AI-generated palette application.
   */
  const handleApplyAIPalette = (palette: ColorPalette) => {
    setColors(palette);
    setHasChanges(true);
    applyColorsToDOM(palette, useGradients);
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
            {/* Gradient Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div className="space-y-0.5">
                <Label htmlFor="gradient-toggle" className="text-base font-medium">
                  Use Gradient Colors
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable gradients across the site, or use solid colors for a cleaner look
                </p>
              </div>
              <Switch
                id="gradient-toggle"
                checked={useGradients}
                onCheckedChange={handleGradientToggle}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize text-sm font-medium">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="flex items-center gap-3">
                    {/* Color Swatch */}
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-md border-2 border-border cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                        style={{ backgroundColor: value }}
                        onClick={() => document.getElementById(`color-picker-${key}`)?.click()}
                      />
                      <input
                        id={`color-picker-${key}`}
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value.toUpperCase())}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {/* Hex Input */}
                    <Input
                      id={key}
                      value={value.toUpperCase()}
                      onChange={(e) => {
                        let hex = e.target.value.toUpperCase();
                        if (!hex.startsWith('#')) hex = '#' + hex;
                        if (/^#[0-9A-F]{0,6}$/i.test(hex)) {
                          handleColorChange(key, hex);
                        }
                      }}
                      placeholder="#000000"
                      className="flex-1 font-mono text-sm h-12 border-2"
                      maxLength={7}
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
