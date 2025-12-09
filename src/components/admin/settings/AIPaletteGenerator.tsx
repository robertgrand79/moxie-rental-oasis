import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Upload, Palette, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

interface AIPaletteGeneratorProps {
  onApplyPalette: (palette: ColorPalette) => void;
}

const vibeOptions = [
  { value: "Beachy", label: "🏖️ Beachy", description: "Ocean blues, sandy beiges, seafoam greens" },
  { value: "Mountain Lodge", label: "🏔️ Mountain Lodge", description: "Earthy browns, forest greens, warm wood" },
  { value: "Modern Luxury", label: "✨ Modern Luxury", description: "Sleek neutrals, gold accents, minimal" },
  { value: "Rustic Cabin", label: "🪵 Rustic Cabin", description: "Warm browns, burnt orange, cozy tones" },
  { value: "Desert Retreat", label: "🌵 Desert Retreat", description: "Terracotta, sage, warm sand colors" },
  { value: "Urban Chic", label: "🏙️ Urban Chic", description: "Industrial grays, copper, contemporary" },
  { value: "Tropical Paradise", label: "🌴 Tropical Paradise", description: "Vibrant greens, turquoise, sunny" },
  { value: "Cozy Cottage", label: "🏡 Cozy Cottage", description: "Soft pastels, cream, romantic" },
];

const AIPaletteGenerator: React.FC<AIPaletteGeneratorProps> = ({ onApplyPalette }) => {
  const [selectedVibe, setSelectedVibe] = useState<string>("");
  const [generatingVibe, setGeneratingVibe] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [suggestedPalette, setSuggestedPalette] = useState<ColorPalette | null>(null);
  const [paletteName, setPaletteName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const generateFromVibe = async () => {
    if (!selectedVibe) {
      toast({ title: "Select a vibe", description: "Please select an aesthetic first", variant: "destructive" });
      return;
    }

    setGeneratingVibe(true);
    setSuggestedPalette(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-color-palette', {
        body: { type: 'vibe', vibe: selectedVibe }
      });

      if (error) throw error;

      setSuggestedPalette(data.palette);
      setPaletteName(data.name || `${selectedVibe} Palette`);
      toast({ title: "Palette generated!", description: `Created "${data.name}" palette` });
    } catch (err) {
      console.error('Error generating palette:', err);
      toast({ title: "Generation failed", description: "Could not generate palette. Try again.", variant: "destructive" });
    } finally {
      setGeneratingVibe(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 5MB", variant: "destructive" });
      return;
    }

    setGeneratingPhoto(true);
    setSuggestedPalette(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

        try {
          const { data, error } = await supabase.functions.invoke('generate-color-palette', {
            body: { type: 'photo', imageBase64: base64 }
          });

          if (error) throw error;

          setSuggestedPalette(data.palette);
          setPaletteName(data.name || "Photo-Inspired Palette");
          toast({ title: "Palette extracted!", description: `Created "${data.name}" from your photo` });
        } catch (err) {
          console.error('Error generating palette:', err);
          toast({ title: "Extraction failed", description: "Could not extract colors. Try another image.", variant: "destructive" });
        } finally {
          setGeneratingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setGeneratingPhoto(false);
      toast({ title: "Upload failed", description: "Could not process image", variant: "destructive" });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApply = () => {
    if (suggestedPalette) {
      onApplyPalette(suggestedPalette);
      toast({ title: "Palette applied!", description: "Click 'Apply Colors' to save changes" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Palette Generator
        </CardTitle>
        <CardDescription>
          Generate a custom color palette using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generate from Photo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Generate from Photo</h4>
              <p className="text-sm text-muted-foreground">Upload a property image to extract colors</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={generatingPhoto}
              >
                {generatingPhoto ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          {/* Generate from Vibe */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Generate from Vibe</h4>
              <p className="text-sm text-muted-foreground">Select an aesthetic and generate matching colors</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedVibe} onValueChange={setSelectedVibe}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an aesthetic..." />
                </SelectTrigger>
                <SelectContent>
                  {vibeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={generateFromVibe}
                disabled={!selectedVibe || generatingVibe}
              >
                {generatingVibe ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Palette className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Suggested Palette Preview */}
        {suggestedPalette && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{paletteName}</h4>
                <p className="text-sm text-muted-foreground">Preview your AI-generated palette</p>
              </div>
              <Button onClick={handleApply} className="gap-2">
                <Check className="h-4 w-4" />
                Apply Palette
              </Button>
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(suggestedPalette).map(([key, color]) => (
                <div key={key} className="space-y-1">
                  <div
                    className="h-16 rounded-lg border shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs text-center capitalize text-muted-foreground">{key}</p>
                  <p className="text-xs text-center font-mono">{color}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIPaletteGenerator;
