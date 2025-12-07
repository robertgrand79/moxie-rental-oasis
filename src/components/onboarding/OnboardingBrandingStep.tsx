import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onComplete: (data?: Record<string, any>) => void;
  isCompleting: boolean;
}

const OnboardingBrandingStep = ({ onComplete, isCompleting }: Props) => {
  const { organization } = useCurrentOrganization();
  const { toast } = useToast();
  const [siteName, setSiteName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!organization) return;
      
      try {
        // Load from site_settings
        const { data: settings } = await supabase
          .from('site_settings')
          .select('key, value')
          .eq('organization_id', organization.id)
          .in('key', ['site_name', 'logo_url']);

        const settingsMap = settings?.reduce((acc, s) => {
          acc[s.key] = s.value;
          return acc;
        }, {} as Record<string, any>) || {};

        setSiteName(settingsMap.site_name || organization.name || '');
        setLogoUrl(settingsMap.logo_url || organization.logo_url || '');
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to organization data
        setSiteName(organization.name || '');
        setLogoUrl(organization.logo_url || '');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [organization]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!organization || acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organization.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);
      toast({ title: 'Logo uploaded successfully!' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [organization, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const removeLogo = () => {
    setLogoUrl('');
  };

  const handleSave = async () => {
    if (!organization || !siteName) return;
    setSaving(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      // Save site_name setting
      const { error: siteNameError } = await supabase
        .from('site_settings')
        .upsert({
          organization_id: organization.id,
          key: 'site_name',
          value: siteName,
          created_by: user?.id,
        }, {
          onConflict: 'organization_id,key',
        });

      if (siteNameError) throw siteNameError;

      // Save logo_url if provided
      if (logoUrl) {
        const { error: logoError } = await supabase
          .from('site_settings')
          .upsert({
            organization_id: organization.id,
            key: 'logo_url',
            value: logoUrl,
            created_by: user?.id,
          }, {
            onConflict: 'organization_id,key',
          });

        if (logoError) throw logoError;
      }

      // Update organization name and logo if changed
      const updates: Record<string, string> = {};
      if (siteName !== organization.name) updates.name = siteName;
      if (logoUrl) updates.logo_url = logoUrl;
      
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('organizations')
          .update(updates)
          .eq('id', organization.id);
      }

      onComplete({ siteName, logoUrl });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="siteName">Site Name</Label>
        <Input
          id="siteName"
          placeholder="My Vacation Rentals"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">This will appear in your site header and emails</p>
      </div>

      <div className="space-y-2">
        <Label>Logo (optional)</Label>
        
        {logoUrl ? (
          <div className="relative p-4 bg-muted rounded-lg inline-block">
            <img 
              src={logoUrl} 
              alt="Logo preview" 
              className="max-h-20 object-contain"
            />
            <button
              onClick={removeLogo}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="text-sm">
                {uploading ? (
                  <span className="text-muted-foreground">Uploading...</span>
                ) : isDragActive ? (
                  <span className="text-primary font-medium">Drop your logo here</span>
                ) : (
                  <>
                    <span className="font-medium">Click to upload</span>
                    <span className="text-muted-foreground"> or drag and drop</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG or WebP</p>
            </div>
          </div>
        )}
      </div>

      <Button onClick={handleSave} disabled={saving || isCompleting || !siteName}>
        {saving || isCompleting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save & Continue'
        )}
      </Button>
    </div>
  );
};

export default OnboardingBrandingStep;
