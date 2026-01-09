import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, ExternalLink } from 'lucide-react';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';

const TemplateEditingBanner = () => {
  const { organization, switchOrganization } = useCurrentOrganization();
  const { isPlatformAdmin } = usePlatformAdmin();
  const navigate = useNavigate();

  // Only show for platform admins editing template organizations
  if (!isPlatformAdmin || !organization?.is_template_source) {
    return null;
  }

  const handleReturnToPlatform = async () => {
    // Get the platform admin's original org from localStorage or just navigate back
    const originalOrgId = localStorage.getItem('platform_admin_original_org');
    if (originalOrgId) {
      await switchOrganization(originalOrgId);
      localStorage.removeItem('platform_admin_original_org');
    }
    navigate('/admin/platform/templates');
  };

  const handlePreviewSite = () => {
    const previewUrl = `${window.location.origin}/?org=${organization.slug}`;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Palette className="h-4 w-4 text-primary" />
          <span className="font-medium text-primary">Template Editing Mode:</span>
          <span className="text-foreground">{organization.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handlePreviewSite}
            className="h-7 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Preview Site
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReturnToPlatform}
            className="h-7 text-xs"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to Platform Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditingBanner;
