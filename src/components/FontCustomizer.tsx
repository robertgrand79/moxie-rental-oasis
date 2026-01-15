import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Type, Save, RotateCcw, Check } from 'lucide-react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { cn } from '@/lib/utils';

interface FontPairing {
  id: string;
  name: string;
  heading: string;
  body: string;
  description: string;
  category: string;
}

interface SizeScale {
  id: string;
  name: string;
  description: string;
  baseSize: string;
  headingScale: string;
  lineHeight: string;
}

const fontPairings: FontPairing[] = [
  {
    id: 'playfair-source',
    name: 'Playfair Display + Source Sans Pro',
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
    description: 'Classic elegance meets modern readability',
    category: 'Elegant'
  },
  {
    id: 'montserrat-lora',
    name: 'Montserrat + Lora',
    heading: 'Montserrat',
    body: 'Lora',
    description: 'Contemporary headers with traditional body text',
    category: 'Modern Classic'
  },
  {
    id: 'cormorant-proza',
    name: 'Cormorant Garamond + Proza Libre',
    heading: 'Cormorant Garamond',
    body: 'Proza Libre',
    description: 'Luxurious serif pairing for upscale properties',
    category: 'Luxury'
  },
  {
    id: 'josefin-open',
    name: 'Josefin Sans + Open Sans',
    heading: 'Josefin Sans',
    body: 'Open Sans',
    description: 'Light and airy for beach/coastal vibes',
    category: 'Coastal'
  },
  {
    id: 'cabin-crimson',
    name: 'Cabin + Crimson Text',
    heading: 'Cabin',
    body: 'Crimson Text',
    description: 'Warm and inviting for cabin/lodge properties',
    category: 'Rustic'
  },
  {
    id: 'raleway-roboto',
    name: 'Raleway + Roboto',
    heading: 'Raleway',
    body: 'Roboto',
    description: 'Clean and minimalist modern aesthetic',
    category: 'Minimalist'
  },
  {
    id: 'dm-serif-dm-sans',
    name: 'DM Serif Display + DM Sans',
    heading: 'DM Serif Display',
    body: 'DM Sans',
    description: 'Bold statements with clean readability',
    category: 'Contemporary'
  },
  {
    id: 'libre-baskerville-source',
    name: 'Libre Baskerville + Source Sans Pro',
    heading: 'Libre Baskerville',
    body: 'Source Sans Pro',
    description: 'Timeless sophistication for boutique stays',
    category: 'Boutique'
  },
  {
    id: 'poppins-merriweather',
    name: 'Poppins + Merriweather',
    heading: 'Poppins',
    body: 'Merriweather',
    description: 'Friendly modern headers with readable serif body',
    category: 'Friendly'
  },
  {
    id: 'abril-lato',
    name: 'Abril Fatface + Lato',
    heading: 'Abril Fatface',
    body: 'Lato',
    description: 'Dramatic display font for bold branding',
    category: 'Bold'
  }
];

const sizeScales: SizeScale[] = [
  {
    id: 'compact',
    name: 'Compact',
    description: 'Smaller text for dense layouts',
    baseSize: '14px',
    headingScale: '1.2',
    lineHeight: '1.5'
  },
  {
    id: 'default',
    name: 'Default',
    description: 'Balanced sizing for most sites',
    baseSize: '16px',
    headingScale: '1.25',
    lineHeight: '1.6'
  },
  {
    id: 'spacious',
    name: 'Spacious',
    description: 'Larger text for better readability',
    baseSize: '18px',
    headingScale: '1.333',
    lineHeight: '1.75'
  }
];

const FontCustomizer = () => {
  const { settings, saveSetting } = useSimplifiedSiteSettings();
  const [selectedPairing, setSelectedPairing] = useState<string>('playfair-source');
  const [selectedScale, setSelectedScale] = useState<string>('default');
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load fonts from settings on mount
  useEffect(() => {
    if (settings?.fontPairing) {
      setSelectedPairing(settings.fontPairing);
    }
    if (settings?.fontScale) {
      setSelectedScale(settings.fontScale);
    }
  }, [settings]);

  const loadGoogleFont = (fontName: string) => {
    if (loadedFonts.has(fontName)) return;
    
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    link.id = `font-${fontName.replace(/ /g, '-')}`;
    // Load fonts asynchronously (non-render-blocking)
    link.media = 'print';
    link.onload = () => { link.media = 'all'; };
    
    const existing = document.getElementById(link.id);
    if (!existing) {
      document.head.appendChild(link);
      setLoadedFonts(prev => new Set([...prev, fontName]));
    }
  };

  // Preload all fonts for preview
  useEffect(() => {
    fontPairings.forEach(pairing => {
      loadGoogleFont(pairing.heading);
      loadGoogleFont(pairing.body);
    });
  }, []);

  const getCurrentPairing = () => fontPairings.find(p => p.id === selectedPairing) || fontPairings[0];
  const getCurrentScale = () => sizeScales.find(s => s.id === selectedScale) || sizeScales[1];

  const applyFontsToDOM = () => {
    const pairing = getCurrentPairing();
    const scale = getCurrentScale();
    const root = document.documentElement;
    
    // Set CSS custom properties
    root.style.setProperty('--font-heading', `"${pairing.heading}", serif`);
    root.style.setProperty('--font-body', `"${pairing.body}", sans-serif`);
    root.style.setProperty('--font-base-size', scale.baseSize);
    root.style.setProperty('--font-heading-scale', scale.headingScale);
    root.style.setProperty('--font-line-height', scale.lineHeight);
    
    // Calculate heading sizes using the scale
    const baseSize = parseInt(scale.baseSize);
    const ratio = parseFloat(scale.headingScale);
    root.style.setProperty('--font-size-h1', `${(baseSize * Math.pow(ratio, 5)).toFixed(0)}px`);
    root.style.setProperty('--font-size-h2', `${(baseSize * Math.pow(ratio, 4)).toFixed(0)}px`);
    root.style.setProperty('--font-size-h3', `${(baseSize * Math.pow(ratio, 3)).toFixed(0)}px`);
    root.style.setProperty('--font-size-h4', `${(baseSize * Math.pow(ratio, 2)).toFixed(0)}px`);
    root.style.setProperty('--font-size-h5', `${(baseSize * Math.pow(ratio, 1)).toFixed(0)}px`);
    root.style.setProperty('--font-size-body', scale.baseSize);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSetting('fontPairing', selectedPairing);
      await saveSetting('fontScale', selectedScale);
      
      applyFontsToDOM();
      
      toast({
        title: "Typography saved",
        description: "Your font settings have been applied globally.",
      });
    } catch (error) {
      toast({
        title: "Error saving",
        description: "Could not save typography settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSelectedPairing('playfair-source');
    setSelectedScale('default');
    
    const root = document.documentElement;
    root.style.removeProperty('--font-heading');
    root.style.removeProperty('--font-body');
    root.style.removeProperty('--font-base-size');
    root.style.removeProperty('--font-heading-scale');
    root.style.removeProperty('--font-line-height');
    root.style.removeProperty('--font-size-h1');
    root.style.removeProperty('--font-size-h2');
    root.style.removeProperty('--font-size-h3');
    root.style.removeProperty('--font-size-h4');
    root.style.removeProperty('--font-size-h5');
    root.style.removeProperty('--font-size-body');
    
    await saveSetting('fontPairing', 'playfair-source');
    await saveSetting('fontScale', 'default');
    
    toast({
      title: "Typography reset",
      description: "Fonts have been reset to defaults.",
    });
  };

  // Apply fonts on mount if settings exist
  useEffect(() => {
    if (settings?.fontPairing || settings?.fontScale) {
      applyFontsToDOM();
    }
  }, [settings?.fontPairing, settings?.fontScale]);

  const currentPairing = getCurrentPairing();
  const currentScale = getCurrentScale();

  return (
    <div className="space-y-6">
      {/* Font Pairing Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Font Pairings
          </CardTitle>
          <CardDescription>
            Choose a curated font combination for your hospitality website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fontPairings.map((pairing) => (
              <div
                key={pairing.id}
                onClick={() => setSelectedPairing(pairing.id)}
                className={cn(
                  "relative p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                  selectedPairing === pairing.id 
                    ? "border-primary bg-primary/5 ring-1 ring-primary" 
                    : "border-border"
                )}
              >
                {selectedPairing === pairing.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="space-y-2">
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {pairing.category}
                  </span>
                  <h4 
                    className="text-lg font-semibold"
                    style={{ fontFamily: `"${pairing.heading}", serif` }}
                  >
                    {pairing.name.split(' + ')[0]}
                  </h4>
                  <p 
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: `"${pairing.body}", sans-serif` }}
                  >
                    {pairing.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            See how your selected fonts look together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="p-6 border rounded-lg bg-background space-y-4"
            style={{ 
              fontSize: currentScale.baseSize,
              lineHeight: currentScale.lineHeight 
            }}
          >
            <h1 
              className="text-3xl font-bold"
              style={{ fontFamily: `"${currentPairing.heading}", serif` }}
            >
              Welcome to Paradise
            </h1>
            <h2 
              className="text-2xl font-semibold text-muted-foreground"
              style={{ fontFamily: `"${currentPairing.heading}", serif` }}
            >
              Your Perfect Getaway Awaits
            </h2>
            <p 
              style={{ fontFamily: `"${currentPairing.body}", sans-serif` }}
            >
              Experience the ultimate in relaxation and comfort at our stunning vacation rental. 
              Nestled in a serene location, our property offers breathtaking views, modern amenities, 
              and the perfect atmosphere for creating unforgettable memories with your loved ones.
            </p>
            <p 
              className="text-sm text-muted-foreground"
              style={{ fontFamily: `"${currentPairing.body}", sans-serif` }}
            >
              Book now and discover why guests keep coming back year after year. 
              From sunrise to sunset, every moment here is extraordinary.
            </p>
            <div className="flex gap-4 pt-2">
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                style={{ fontFamily: `"${currentPairing.body}", sans-serif` }}
              >
                Book Now
              </button>
              <button 
                className="px-4 py-2 border border-border rounded-md"
                style={{ fontFamily: `"${currentPairing.body}", sans-serif` }}
              >
                Learn More
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font Size Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Size Scale</CardTitle>
          <CardDescription>
            Adjust the overall text size throughout your site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedScale} 
            onValueChange={setSelectedScale}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {sizeScales.map((scale) => (
              <div key={scale.id} className="relative">
                <RadioGroupItem
                  value={scale.id}
                  id={scale.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={scale.id}
                  className={cn(
                    "flex flex-col p-4 border rounded-lg cursor-pointer transition-all",
                    "hover:border-primary/50 peer-data-[state=checked]:border-primary",
                    "peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                  )}
                >
                  <span className="font-medium">{scale.name}</span>
                  <span className="text-sm text-muted-foreground">{scale.description}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Base: {scale.baseSize} · Line height: {scale.lineHeight}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1" disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Typography'}
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default FontCustomizer;
