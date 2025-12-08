import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Type, Save, RotateCcw } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

const FontCustomizer = () => {
  const { organization } = useCurrentOrganization();
  const [fonts, setFonts] = useState({
    heading: 'Playfair Display',
    body: 'Inter',
    accent: 'Great Vibes'
  });

  const { toast } = useToast();

  // Tenant-scoped localStorage key
  const getStorageKey = () => {
    const orgId = organization?.id || 'default';
    return `customFonts_${orgId}`;
  };

  const googleFonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Source Sans Pro',
    'Oswald',
    'Raleway',
    'PT Sans',
    'Lora',
    'Merriweather',
    'Playfair Display',
    'Poppins',
    'Nunito',
    'Dancing Script',
    'Great Vibes',
    'Pacifico',
    'Lobster'
  ];

  const loadGoogleFont = (fontName: string) => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    link.id = `font-${fontName.replace(' ', '-')}`;
    
    // Remove existing font link if it exists
    const existing = document.getElementById(`font-${fontName.replace(' ', '-')}`);
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(link);
  };

  const handleFontChange = (fontType: string, fontName: string) => {
    setFonts(prev => ({
      ...prev,
      [fontType]: fontName
    }));
    
    loadGoogleFont(fontName);
  };

  const applyFonts = () => {
    const root = document.documentElement;
    
    root.style.setProperty('--font-heading', `"${fonts.heading}", serif`);
    root.style.setProperty('--font-body', `"${fonts.body}", sans-serif`);
    root.style.setProperty('--font-accent', `"${fonts.accent}", cursive`);

    // Apply to common elements
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      (heading as HTMLElement).style.fontFamily = `"${fonts.heading}", serif`;
    });

    const bodyElements = document.querySelectorAll('p, span, div, a, button');
    bodyElements.forEach(element => {
      if (!(element as HTMLElement).closest('h1, h2, h3, h4, h5, h6')) {
        (element as HTMLElement).style.fontFamily = `"${fonts.body}", sans-serif`;
      }
    });

    // Save with tenant-scoped key
    localStorage.setItem(getStorageKey(), JSON.stringify(fonts));
    
    toast({
      title: "Fonts Applied",
      description: "Your custom fonts have been applied to the site.",
    });
  };

  const resetFonts = () => {
    const defaultFonts = {
      heading: 'Inter',
      body: 'Inter',
      accent: 'Inter'
    };
    
    setFonts(defaultFonts);
    localStorage.removeItem(getStorageKey());
    
    // Reset CSS variables
    const root = document.documentElement;
    root.style.removeProperty('--font-heading');
    root.style.removeProperty('--font-body');
    root.style.removeProperty('--font-accent');

    // Reset element styles
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      (element as HTMLElement).style.removeProperty('font-family');
    });

    toast({
      title: "Fonts Reset",
      description: "Fonts have been reset to default values.",
    });
  };

  useEffect(() => {
    // Load the fonts
    loadGoogleFont('Playfair Display');
    loadGoogleFont('Great Vibes');
    
    // Apply the fonts automatically
    setTimeout(() => {
      applyFonts();
    }, 500);

    // Load saved fonts with tenant-scoped key
    const savedFonts = localStorage.getItem(getStorageKey());
    if (savedFonts) {
      const parsed = JSON.parse(savedFonts);
      setFonts(parsed);
      
      // Load saved fonts
      Object.values(parsed).forEach(fontName => {
        if (fontName !== 'Inter') {
          loadGoogleFont(fontName as string);
        }
      });
    }
  }, [organization?.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Type className="h-5 w-5 mr-2" />
          Font Customization
        </CardTitle>
        <CardDescription>
          Choose fonts for different parts of your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Heading Font</Label>
            <Select value={fonts.heading} onValueChange={(value) => handleFontChange('heading', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {googleFonts.map(font => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="p-3 border rounded" style={{ fontFamily: fonts.heading }}>
              <h3 className="text-lg font-semibold">Sample Heading</h3>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Body Font</Label>
            <Select value={fonts.body} onValueChange={(value) => handleFontChange('body', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {googleFonts.map(font => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="p-3 border rounded" style={{ fontFamily: fonts.body }}>
              <p>This is sample body text to preview the font.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Accent Font</Label>
            <Select value={fonts.accent} onValueChange={(value) => handleFontChange('accent', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {googleFonts.map(font => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="p-3 border rounded" style={{ fontFamily: fonts.accent }}>
              <span className="text-sm italic">Accent text sample</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={applyFonts} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Apply Fonts
          </Button>
          <Button onClick={resetFonts} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FontCustomizer;
