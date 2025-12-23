import React from 'react';
import { Building2, Shield, Crown, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const OrganizationBadge: React.FC = () => {
  const { organization, membership, isPlatformAdmin, loading } = useCurrentOrganization();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md animate-pulse">
        <div className="h-4 w-4 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    );
  }

  const getRoleIcon = () => {
    if (isPlatformAdmin) return <Shield className="h-3.5 w-3.5" />;
    if (membership?.role === 'owner') return <Crown className="h-3.5 w-3.5" />;
    if (membership?.role === 'admin') return <Shield className="h-3.5 w-3.5" />;
    return <User className="h-3.5 w-3.5" />;
  };

  const getRoleBadgeVariant = () => {
    if (isPlatformAdmin) return 'secondary';
    if (membership?.role === 'owner') return 'default';
    if (membership?.role === 'admin') return 'secondary';
    return 'outline';
  };

  const getRoleLabel = () => {
    if (isPlatformAdmin) return 'Platform Admin';
    if (membership?.role === 'owner') return 'Owner';
    if (membership?.role === 'admin') return 'Admin';
    return 'Member';
  };

  if (!organization) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-md border border-destructive/20">
        <Building2 className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">No Organization</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getRoleBadgeVariant()} className="flex items-center gap-1 text-xs px-3 py-1.5 cursor-default">
            {getRoleIcon()}
            {getRoleLabel()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{organization.name}</p>
            {organization.slug && (
              <p className="text-xs text-muted-foreground">Slug: {organization.slug}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Role: {getRoleLabel()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OrganizationBadge;
