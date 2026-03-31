import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, Building2, Settings, Mail, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types/organizations';

interface TemplatePreviewModalProps {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigure?: (org: Organization) => void;
}

interface SiteSettingsData {
  site_name?: string;
  tagline?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  hero_title?: string;
  hero_subtitle?: string;
  enable_blog?: boolean;
  enable_reviews?: boolean;
  enable_bookings?: boolean;
}

export const TemplatePreviewModal = ({ 
  organization, 
  open, 
  onOpenChange,
  onConfigure 
}: TemplatePreviewModalProps) => {
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>({});
  const [propertyCount, setPropertyCount] = useState(0);

  useEffect(() => {
    if (open && organization) {
      fetchTemplateData();
    }
  }, [open, organization]);

  const fetchTemplateData = async () => {
    if (!organization) return;
    
    setLoading(true);
    try {
      // Fetch site settings - these are stored as key-value pairs
      const { data: settingsRows } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', organization.id);

      // Convert key-value rows to object
      const settings: Record<string, unknown> = {};
      settingsRows?.forEach(row => {
        settings[row.key] = row.value;
      });
      setSiteSettings(settings as SiteSettingsData);

      // Fetch property count
      const { count } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organization.id);

      setPropertyCount(count || 0);
    } catch (error) {
      console.error('Error fetching template data:', error);
    } finally {
      setLoading(false);
    }
  };

  const ConfigStatus = ({ configured }: { configured: boolean }) => (
    configured ? (
      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
        <Check className="h-3 w-3" /> Configured
      </span>
    ) : (
      <span className="flex items-center gap-1 text-muted-foreground">
        <X className="h-3 w-3" /> Not set
      </span>
    )
  );

  const SettingRow = ({ label, value }: { label: string; value?: string | boolean | null }) => (
    <div className="flex justify-between items-center py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <ConfigStatus configured={!!value} />
    </div>
  );

  if (!organization) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Template Preview
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-6">
              {/* Overview */}
              <div className="flex items-start gap-4">
                {organization.logo_url ? (
                  <img 
                    src={organization.logo_url} 
                    alt={organization.name}
                    className="h-16 w-16 rounded-lg object-contain bg-muted p-2"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{organization.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {organization.template_type === 'single_property' ? 'Single Property' : 'Multi-Property'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Slug: {organization.slug}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Site Settings */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Settings className="h-4 w-4" />
                  Site Settings
                </h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <SettingRow label="Site Name" value={siteSettings.site_name} />
                  <SettingRow label="Tagline" value={siteSettings.tagline} />
                  <SettingRow label="Logo" value={siteSettings.logo_url} />
                  <SettingRow label="Primary Color" value={siteSettings.primary_color} />
                  <SettingRow label="Contact Email" value={siteSettings.contact_email} />
                  <SettingRow label="Contact Phone" value={siteSettings.contact_phone} />
                  <SettingRow label="Address" value={siteSettings.address} />
                  <SettingRow label="Hero Title" value={siteSettings.hero_title} />
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4" />
                  Features Enabled
                </h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <SettingRow label="Blog" value={siteSettings.enable_blog} />
                  <SettingRow label="Reviews" value={siteSettings.enable_reviews} />
                  <SettingRow label="Bookings" value={siteSettings.enable_bookings} />
                </div>
              </div>

              {/* Properties */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4" />
                  Demo Properties
                </h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Properties included</span>
                    <Badge variant="secondary">{propertyCount}</Badge>
                  </div>
                </div>
              </div>

              {/* Integrations */}
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4" />
                  Integrations Configured
                </h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <SettingRow label="Stripe" value={organization.has_stripe_configured ? 'Configured' : null} />
                  <SettingRow label="PriceLabs" value={organization.has_pricelabs_configured ? 'Configured' : null} />
                  <SettingRow label="Resend (Email)" value={organization.has_resend_configured ? 'Configured' : null} />
                  <SettingRow label="QUO (SMS)" value={organization.has_openphone_configured ? 'Configured' : null} />
                  <SettingRow label="SEAM (Smart Home)" value={organization.has_seam_configured ? 'Configured' : null} />
                  <SettingRow label="Turno (Cleaning)" value={organization.has_turno_configured ? 'Configured' : null} />
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          {onConfigure && (
            <Button variant="outline" onClick={() => onConfigure(organization)}>
              Configure Template
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
