
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Palette, RotateCcw, Save, Eye } from 'lucide-react';
import AIPaletteGenerator from '@/components/admin/settings/AIPaletteGenerator';
import SiteThemePreview from '@/components/admin/settings/SiteThemePreview';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

const ColorCustomizer = () => {
  const [colors, setColors] = useState<ColorPalette>({
    primary: '#767b8d',
    secondary: '#8b929a',
    accent: '#cbcfd2',
    background: '#ffffff',
    text: '#1a202c',
    muted: '#ececec',
  });
  const [previewOpen, setPreviewOpen] = useState(true);

  const { toast } = useToast();

  const handleColorChange = (colorKey: string, value: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const applyColors = () => {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS custom properties
    const hexToHsl = (hex: string) => {
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

    // Apply colors to CSS custom properties
    root.style.setProperty('--primary', hexToHsl(colors.primary));
    root.style.setProperty('--secondary', hexToHsl(colors.secondary));
    root.style.setProperty('--accent', hexToHsl(colors.accent));
    root.style.setProperty('--background', hexToHsl(colors.background));
    root.style.setProperty('--foreground', hexToHsl(colors.text));
    root.style.setProperty('--muted', hexToHsl(colors.muted));

    // Also update gradient colors to match the new palette
    const primaryHsl = hexToHsl(colors.primary);
    const secondaryHsl = hexToHsl(colors.secondary);
    const accentHsl = hexToHsl(colors.accent);
    
    root.style.setProperty('--gradient-from', primaryHsl);
    root.style.setProperty('--gradient-via', secondaryHsl);
    root.style.setProperty('--gradient-to', accentHsl);
    root.style.setProperty('--gradient-accent-from', secondaryHsl);
    root.style.setProperty('--gradient-accent-to', accentHsl);

    // Also update hero colors based on primary
    root.style.setProperty('--hero-gradient-from', primaryHsl);
    root.style.setProperty('--hero-gradient-to', secondaryHsl);
    
    // Also update footer colors based on primary
    root.style.setProperty('--footer-bg', primaryHsl);

    localStorage.setItem('customColors', JSON.stringify(colors));
    
    toast({
      title: "Colors Applied",
      description: "Your custom colors have been applied to the site.",
    });
  };

  const resetColors = () => {
    const defaultColors = {
      primary: '#767b8d',
      secondary: '#8b929a',
      accent: '#cbcfd2',
      background: '#ffffff',
      text: '#1a202c',
      muted: '#ececec',
    };
    setColors(defaultColors);
    localStorage.removeItem('customColors');
    
    // Reset CSS variables to default
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--background');
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--muted');
    root.style.removeProperty('--gradient-from');
    root.style.removeProperty('--gradient-via');
    root.style.removeProperty('--gradient-to');
    root.style.removeProperty('--gradient-accent-from');
    root.style.removeProperty('--gradient-accent-to');

    toast({
      title: "Colors Reset",
      description: "Colors have been reset to default gray palette values.",
    });
  };

  useEffect(() => {
    const savedColors = localStorage.getItem('customColors');
    if (savedColors) {
      const parsed = JSON.parse(savedColors);
      setColors(parsed);
      // Apply saved colors on load
      setTimeout(() => {
        applyColors();
      }, 100);
    } else {
      // Apply default gray colors on first load
      setTimeout(() => {
        applyColors();
      }, 100);
    }
  }, []);

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
    { name: 'Ocean Blue', colors: { primary: '#0077be', secondary: '#00a8cc', accent: '#00d4aa' } },
    { name: 'Sunset Orange', colors: { primary: '#ff6b35', secondary: '#f7931e', accent: '#ffcc02' } },
    { name: 'Forest Green', colors: { primary: '#2d5016', secondary: '#4a7c59', accent: '#87a96b' } },
    { name: 'Royal Purple', colors: { primary: '#5d2e5d', secondary: '#8e44ad', accent: '#c39bd3' } },
  ];

  const applyPreset = (preset: any) => {
    setColors(prev => ({
      ...prev,
      ...preset.colors
    }));
  };

  const handleApplyAIPalette = (palette: ColorPalette) => {
    setColors(palette);
  };

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
            Customize your site's color scheme. The gray palette matches your uploaded design.
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
            <Button onClick={applyColors} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Apply Colors
            </Button>
            <Button onClick={resetColors} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Gray Palette
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
                  {Object.values(preset.colors).slice(0, 3).map((color, index) => (
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
