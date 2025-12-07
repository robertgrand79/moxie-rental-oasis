import { useState } from 'react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onComplete: (data?: Record<string, any>) => void;
  isCompleting: boolean;
}

const OnboardingBrandingStep = ({ onComplete, isCompleting }: Props) => {
  const { organization } = useCurrentOrganization();
  const { toast } = useToast();
  const [siteName, setSiteName] = useState(organization?.name || '');
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!organization) return;
    setSaving(true);

    try {
      // Save site settings
      const settings = [
        { key: 'site_name', value: siteName },
        { key: 'logo_url', value: logoUrl },
      ].filter(s => s.value);

      for (const setting of settings) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            organization_id: organization.id,
            key: setting.key,
            value: setting.value,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          }, {
            onConflict: 'organization_id,key',
          });

        if (error) throw error;
      }

      // Update organization name if changed
      if (siteName !== organization.name) {
        await supabase
          .from('organizations')
          .update({ name: siteName })
          .eq('id', organization.id);
      }

      onComplete({ siteName, logoUrl });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

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
        <Label htmlFor="logoUrl">Logo URL (optional)</Label>
        <Input
          id="logoUrl"
          type="url"
          placeholder="https://example.com/logo.png"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Link to your logo image</p>
      </div>

      {logoUrl && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Logo Preview:</p>
          <img 
            src={logoUrl} 
            alt="Logo preview" 
            className="max-h-16 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

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
