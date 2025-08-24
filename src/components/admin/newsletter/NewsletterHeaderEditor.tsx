import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface HeaderConfig {
  title: string;
  subtitle: string;
  background_gradient: {
    from: string;
    to: string;
  };
  text_color: string;
  logo_url: string;
}

interface NewsletterHeaderEditorProps {
  headerConfig: HeaderConfig;
  onHeaderConfigChange: (config: HeaderConfig) => void | Promise<boolean>;
  disabled?: boolean;
}

const NewsletterHeaderEditor = ({ headerConfig, onHeaderConfigChange, disabled = false }: NewsletterHeaderEditorProps) => {
  
  const handleInputChange = (field: keyof HeaderConfig, value: any) => {
    onHeaderConfigChange({
      ...headerConfig,
      [field]: value
    });
  };

  const handleGradientChange = (position: 'from' | 'to', value: string) => {
    onHeaderConfigChange({
      ...headerConfig,
      background_gradient: {
        ...headerConfig.background_gradient,
        [position]: value
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Newsletter Header</CardTitle>
        <CardDescription>
          Configure your newsletter header to match your brand
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title and Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="header-title">Company Name</Label>
            <Input
              id="header-title"
              value={headerConfig.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Moxie Vacation Rentals"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="header-subtitle">Tagline</Label>
            <Input
              id="header-subtitle"
              value={headerConfig.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Your Home Base for Living Like a Local"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            {headerConfig.logo_url ? (
              <div className="relative">
                <img 
                  src={headerConfig.logo_url} 
                  alt="Logo" 
                  className="h-16 w-auto rounded border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={() => handleInputChange('logo_url', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 w-16 border-2 border-dashed border-muted-foreground/25 rounded">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <Input
                value={headerConfig.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder="Enter logo URL or upload image"
              />
            </div>
          </div>
        </div>

        {/* Background Gradient Colors */}
        <div className="space-y-4">
          <Label>Background Gradient</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gradient-from" className="text-sm">From Color</Label>
              <div className="flex gap-2">
                <Input
                  id="gradient-from"
                  value={headerConfig.background_gradient.from}
                  onChange={(e) => handleGradientChange('from', e.target.value)}
                  placeholder="hsl(220, 8%, 85%)"
                />
                <div 
                  className="w-10 h-10 rounded border border-border"
                  style={{ backgroundColor: headerConfig.background_gradient.from }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradient-to" className="text-sm">To Color</Label>
              <div className="flex gap-2">
                <Input
                  id="gradient-to"
                  value={headerConfig.background_gradient.to}
                  onChange={(e) => handleGradientChange('to', e.target.value)}
                  placeholder="hsl(220, 3%, 97%)"
                />
                <div 
                  className="w-10 h-10 rounded border border-border"
                  style={{ backgroundColor: headerConfig.background_gradient.to }}
                />
              </div>
            </div>
          </div>
          
          {/* Gradient Preview */}
          <div className="space-y-2">
            <Label className="text-sm">Preview</Label>
            <div 
              className="h-20 rounded border border-border"
              style={{
                background: `linear-gradient(135deg, ${headerConfig.background_gradient.from}, ${headerConfig.background_gradient.to})`
              }}
            />
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label htmlFor="text-color">Text Color</Label>
          <div className="flex gap-2">
            <Input
              id="text-color"
              value={headerConfig.text_color}
              onChange={(e) => handleInputChange('text_color', e.target.value)}
              placeholder="hsl(222.2, 47.4%, 11.2%)"
            />
            <div 
              className="w-10 h-10 rounded border border-border"
              style={{ backgroundColor: headerConfig.text_color }}
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <Label>Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onHeaderConfigChange({
                ...headerConfig,
                background_gradient: {
                  from: 'hsl(220, 8%, 85%)',
                  to: 'hsl(220, 3%, 97%)'
                },
                text_color: 'hsl(222.2, 47.4%, 11.2%)'
              })}
            >
              Light Gray
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onHeaderConfigChange({
                ...headerConfig,
                background_gradient: {
                  from: 'hsl(217, 91%, 60%)',
                  to: 'hsl(217, 91%, 70%)'
                },
                text_color: 'hsl(0, 0%, 100%)'
              })}
            >
              Blue
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onHeaderConfigChange({
                ...headerConfig,
                background_gradient: {
                  from: 'hsl(142, 76%, 36%)',
                  to: 'hsl(142, 76%, 46%)'
                },
                text_color: 'hsl(0, 0%, 100%)'
              })}
            >
              Green
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterHeaderEditor;