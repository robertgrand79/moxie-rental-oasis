import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Plane, Save, Loader2 } from 'lucide-react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import ImageUploader from '@/components/ImageUploader';
import { toast } from 'sonner';

const OwnerTravelsSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, saveSetting, saving, loading } = useSimplifiedSiteSettings();
  
  // Local form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Get dynamic default title from founderNames
  const founderNames = settings.founderNames || 'The Owners';
  const defaultTitle = `${founderNames}'s Travels`;

  // Initialize form state from settings
  useEffect(() => {
    if (!loading) {
      setTitle(settings.ownerTravelsTitle || '');
      setDescription(settings.ownerTravelsDescription || '');
      setImageUrl(settings.ownerTravelsImageUrl || null);
      setEnabled(settings.ownerTravelsEnabled !== 'false');
    }
  }, [loading, settings.ownerTravelsTitle, settings.ownerTravelsDescription, settings.ownerTravelsImageUrl, settings.ownerTravelsEnabled]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const results = await Promise.all([
        saveSetting('ownerTravelsTitle', title),
        saveSetting('ownerTravelsDescription', description),
        saveSetting('ownerTravelsImageUrl', imageUrl || ''),
        saveSetting('ownerTravelsEnabled', enabled ? 'true' : 'false'),
      ]);

      if (results.every(Boolean)) {
        toast.success('Owner Travels settings saved!');
      }
    } catch (error) {
      console.error('Failed to save Owner Travels settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (url: string | null) => {
    setImageUrl(url);
  };

  const isAnySaving = isSaving || Object.values(saving).some(Boolean);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plane className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Owner Travels Settings</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Customize how your travel section appears on the blog
                  </p>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="owner-travels-enabled" className="text-base font-medium">
                  Show Owner Travels Section
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display the Owner Travels section on your blog page
                </p>
              </div>
              <Switch
                id="owner-travels-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Travel Photo</Label>
              <p className="text-sm text-muted-foreground">
                Upload a photo of you traveling to personalize this section
              </p>
              <ImageUploader
                uploadedImage={imageUrl}
                onImageChange={handleImageChange}
              />
            </div>

            {/* Custom Title */}
            <div className="space-y-2">
              <Label htmlFor="owner-travels-title">Custom Title</Label>
              <Input
                id="owner-travels-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={defaultTitle}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use: "{defaultTitle}"
              </p>
            </div>

            {/* Custom Description */}
            <div className="space-y-2">
              <Label htmlFor="owner-travels-description">Description</Label>
              <Textarea
                id="owner-travels-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share your passion for travel and what inspires your adventures..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                A personal message to introduce your travel content
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleSave} 
                disabled={isAnySaving}
                className="gap-2"
              >
                {isAnySaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Settings
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default OwnerTravelsSettings;
