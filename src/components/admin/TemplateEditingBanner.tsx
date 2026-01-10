import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { Badge } from '@/components/ui/badge';

interface TemplateEditingBannerProps {
  variant?: 'header' | 'sidebar';
}

const TemplateEditingBanner = ({ variant = 'sidebar' }: TemplateEditingBannerProps) => {
  const { organization, switchOrganization } = useCurrentOrganization();
  const { isPlatformAdmin } = usePlatformAdmin();
  const navigate = useNavigate();

  // Only show for platform admins editing template organizations
  if (!isPlatformAdmin || !organization?.is_template_source) {
    return null;
  }

  const handleReturnToPlatform = async () => {
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

  // Header variant - compact inline buttons for the admin header
  if (variant === 'header') {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-medium">
          Template Mode
        </Badge>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePreviewSite}
          className="h-8 text-xs gap-1"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Preview
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReturnToPlatform}
          className="h-8 text-xs gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Exit Template
        </Button>
      </div>
    );
  }

  // Sidebar variant - shown in the sidebar header area
  return (
    <div className="px-3 py-2 bg-primary/5 border-b border-primary/10">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Template:</span>
          <span className="font-medium text-foreground truncate">{organization.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handlePreviewSite}
            className="h-7 text-xs flex-1"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReturnToPlatform}
            className="h-7 text-xs flex-1"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditingBanner;
