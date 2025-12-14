import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, RotateCcw, Palette } from 'lucide-react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { toast } from 'sonner';
import EmailPreview from './EmailPreview';

const EMAIL_THEMES = [
  {
    name: 'Blue Professional',
    headerColor: '#3b82f6',
    headerColorEnd: '#1d4ed8',
    accentColor: '#3b82f6',
    footerColor: '#f8fafc'
  },
  {
    name: 'Green Nature',
    headerColor: '#22c55e',
    headerColorEnd: '#15803d',
    accentColor: '#22c55e',
    footerColor: '#f0fdf4'
  },
  {
    name: 'Warm Orange',
    headerColor: '#f97316',
    headerColorEnd: '#c2410c',
    accentColor: '#f97316',
    footerColor: '#fff7ed'
  },
  {
    name: 'Elegant Purple',
    headerColor: '#8b5cf6',
    headerColorEnd: '#6d28d9',
    accentColor: '#8b5cf6',
    footerColor: '#faf5ff'
  },
  {
    name: 'Teal Modern',
    headerColor: '#14b8a6',
    headerColorEnd: '#0d9488',
    accentColor: '#14b8a6',
    footerColor: '#f0fdfa'
  },
  {
    name: 'Rose Elegant',
    headerColor: '#f43f5e',
    headerColorEnd: '#be123c',
    accentColor: '#f43f5e',
    footerColor: '#fff1f2'
  }
];

const DEFAULT_COLORS = EMAIL_THEMES[0];

const EmailStylingTab: React.FC = () => {
  const { settings, loading, saveSetting } = useSimplifiedSiteSettings();
  const [saving, setSaving] = useState(false);
  
  const [colors, setColors] = useState({
    headerColor: DEFAULT_COLORS.headerColor,
    headerColorEnd: DEFAULT_COLORS.headerColorEnd,
    accentColor: DEFAULT_COLORS.accentColor,
    footerColor: DEFAULT_COLORS.footerColor
  });

  useEffect(() => {
    if (!loading && settings) {
      setColors({
        headerColor: settings.emailHeaderColor || DEFAULT_COLORS.headerColor,
        headerColorEnd: settings.emailHeaderColorEnd || DEFAULT_COLORS.headerColorEnd,
        accentColor: settings.emailAccentColor || DEFAULT_COLORS.accentColor,
        footerColor: settings.emailFooterColor || DEFAULT_COLORS.footerColor
      });
    }
  }, [loading, settings]);

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const applyTheme = (theme: typeof EMAIL_THEMES[0]) => {
    setColors({
      headerColor: theme.headerColor,
      headerColorEnd: theme.headerColorEnd,
      accentColor: theme.accentColor,
      footerColor: theme.footerColor
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('emailHeaderColor', colors.headerColor),
        saveSetting('emailHeaderColorEnd', colors.headerColorEnd),
        saveSetting('emailAccentColor', colors.accentColor),
        saveSetting('emailFooterColor', colors.footerColor)
      ]);
      toast.success('Email styling saved successfully');
    } catch (error) {
      toast.error('Failed to save email styling');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setColors({
      headerColor: DEFAULT_COLORS.headerColor,
      headerColorEnd: DEFAULT_COLORS.headerColorEnd,
      accentColor: DEFAULT_COLORS.accentColor,
      footerColor: DEFAULT_COLORS.footerColor
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Settings Panel */}
      <div className="space-y-6">
        {/* Quick Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Quick Themes
            </CardTitle>
            <CardDescription>
              Choose a preset theme to quickly style your emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EMAIL_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className="p-3 rounded-lg border hover:border-primary transition-colors text-left"
                >
                  <div 
                    className="h-8 rounded mb-2"
                    style={{ background: `linear-gradient(135deg, ${theme.headerColor} 0%, ${theme.headerColorEnd} 100%)` }}
                  />
                  <span className="text-xs font-medium">{theme.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Colors</CardTitle>
            <CardDescription>
              Fine-tune individual email colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headerColor">Header Start</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="headerColor"
                    value={colors.headerColor}
                    onChange={(e) => handleColorChange('headerColor', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={colors.headerColor}
                    onChange={(e) => handleColorChange('headerColor', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headerColorEnd">Header End</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="headerColorEnd"
                    value={colors.headerColorEnd}
                    onChange={(e) => handleColorChange('headerColorEnd', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={colors.headerColorEnd}
                    onChange={(e) => handleColorChange('headerColorEnd', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="accentColor"
                    value={colors.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={colors.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerColor">Footer Background</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="footerColor"
                    value={colors.footerColor}
                    onChange={(e) => handleColorChange('footerColor', e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={colors.footerColor}
                    onChange={(e) => handleColorChange('footerColor', e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <div>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your emails will look to guests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailPreview
              headerColor={colors.headerColor}
              headerColorEnd={colors.headerColorEnd}
              accentColor={colors.accentColor}
              footerColor={colors.footerColor}
              siteName={settings?.siteName || 'Your Property'}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailStylingTab;
