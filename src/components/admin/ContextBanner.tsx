import React from 'react';
import { Building2, Shield, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { cn } from '@/lib/utils';

interface ContextBannerProps {
  className?: string;
}

const ContextBanner = ({ className }: ContextBannerProps) => {
  const { 
    organization, 
    isPlatformMode, 
    enterPlatformMode 
  } = useCurrentOrganization();
  const { isPlatformAdmin } = usePlatformAdmin();

  // Only show for platform admins viewing a specific organization
  if (!isPlatformAdmin || isPlatformMode || !organization) {
    return null;
  }

  const handleExitToplatform = () => {
    enterPlatformMode();
    // Navigate to platform command center
    window.location.href = '/admin/platform';
  };

  const handleVisitSite = () => {
    // Open the organization's site in a new tab
    const siteUrl = organization.custom_domain 
      ? `https://${organization.custom_domain}`
      : `https://${organization.slug}.staymoxie.com`;
    window.open(siteUrl, '_blank');
  };

  return (
    <div 
      className={cn(
        "bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800",
        "px-4 py-2 flex items-center justify-between gap-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">Platform Admin Viewing:</span>
        </div>
        
        <div className="flex items-center gap-2">
          {organization.logo_url ? (
            <img 
              src={organization.logo_url} 
              alt={organization.name}
              className="h-5 w-5 rounded object-contain"
            />
          ) : (
            <Building2 className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-semibold text-sm">{organization.name}</span>
          <span className="text-xs text-muted-foreground">
            ({organization.slug})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVisitSite}
          className="text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" />
          Visit Site
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExitToplatform}
          className="text-xs gap-1 bg-background"
        >
          <X className="h-3 w-3" />
          Exit to Platform
        </Button>
      </div>
    </div>
  );
};

export default ContextBanner;
