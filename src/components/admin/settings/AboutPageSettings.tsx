import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

interface AboutPageSettingsProps {
  localData: {
    aboutTitle: string;
    aboutDescription: string;
    aboutImageUrl: string;
    founderNames: string;
    missionStatement: string;
    missionDescription: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const AboutPageSettings: React.FC<AboutPageSettingsProps> = ({
  localData,
  onInputChange,
  onSave,
  saving,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { organization } = useCurrentOrganization();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !organization?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organization.id}/about-team-photo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      // Add cache-busting parameter
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
      onInputChange('aboutImageUrl', urlWithCacheBust);
      toast.success('Team photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onInputChange('aboutImageUrl', '');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About Page Content</CardTitle>
          <CardDescription>
            Configure the content displayed on your About page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* About Title */}
          <div className="space-y-2">
            <Label htmlFor="aboutTitle">Page Title</Label>
            <Input
              id="aboutTitle"
              value={localData.aboutTitle}
              onChange={(e) => onInputChange('aboutTitle', e.target.value)}
              placeholder="About Us"
            />
          </div>

          {/* About Description */}
          <div className="space-y-2">
            <Label htmlFor="aboutDescription">Introduction</Label>
            <Textarea
              id="aboutDescription"
              value={localData.aboutDescription}
              onChange={(e) => onInputChange('aboutDescription', e.target.value)}
              placeholder="Tell visitors about your company, history, and what makes you special..."
              rows={4}
            />
          </div>

          {/* Team Photo Upload */}
          <div className="space-y-2">
            <Label>Team Photo</Label>
            <div className="flex items-start gap-4">
              {localData.aboutImageUrl ? (
                <div className="relative">
                  <img
                    src={localData.aboutImageUrl}
                    alt="Team photo"
                    className="w-48 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-48 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload photo</span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {localData.aboutImageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Change Photo
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Recommended: 800x600px or larger. This photo appears in the "Meet Our Team" section.
            </p>
          </div>

          {/* Founder Names */}
          <div className="space-y-2">
            <Label htmlFor="founderNames">Founder/Team Names</Label>
            <Input
              id="founderNames"
              value={localData.founderNames}
              onChange={(e) => onInputChange('founderNames', e.target.value)}
              placeholder="John & Jane Doe"
            />
            <p className="text-sm text-muted-foreground">
              Used for attribution quotes like "— John & Jane Doe"
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mission Statement</CardTitle>
          <CardDescription>
            Share your company's mission and values
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mission Statement */}
          <div className="space-y-2">
            <Label htmlFor="missionStatement">Mission Statement</Label>
            <Textarea
              id="missionStatement"
              value={localData.missionStatement}
              onChange={(e) => onInputChange('missionStatement', e.target.value)}
              placeholder="Our mission is to..."
              rows={3}
            />
          </div>

          {/* Mission Description */}
          <div className="space-y-2">
            <Label htmlFor="missionDescription">Additional Details</Label>
            <Textarea
              id="missionDescription"
              value={localData.missionDescription}
              onChange={(e) => onInputChange('missionDescription', e.target.value)}
              placeholder="Expand on your mission, values, or company philosophy..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save About Page Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AboutPageSettings;
