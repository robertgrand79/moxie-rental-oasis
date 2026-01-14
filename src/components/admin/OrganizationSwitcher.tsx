import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, Check, Shield, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Organization } from '@/types/organizations';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface OrganizationWithRole {
  organization: Organization;
  role: string;
}

const OrganizationSwitcher = () => {
  const { 
    organization, 
    isPlatformAdmin, 
    isPlatformMode,
    switchOrganization, 
    enterPlatformMode 
  } = useCurrentOrganization();
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch all organizations for platform admins, or just user's orgs for regular users
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        if (isPlatformAdmin) {
          // Platform admins can see all organizations
          const { data: orgs, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('is_active', true)
            .order('name');

          if (error) throw error;

          setOrganizations(
            (orgs || []).map(org => ({
              organization: org as unknown as Organization,
              role: 'platform_admin'
            }))
          );
        } else {
          // Regular users see only their organizations
          const { data: memberships, error } = await supabase
            .from('organization_members')
            .select(`
              role,
              organization:organizations(*)
            `)
            .order('joined_at', { ascending: true });

          if (error) throw error;

          setOrganizations(
            (memberships || [])
              .filter((m: any) => m.organization)
              .map((m: any) => ({
                organization: m.organization as Organization,
                role: m.role
              }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [open, isPlatformAdmin]);

  const handleSwitchOrganization = async (orgId: string) => {
    const success = await switchOrganization(orgId);
    if (success) {
      toast({
        title: "Organization switched",
        description: "You are now viewing a different organization",
      });
      setOpen(false);
    } else {
      toast({
        title: "Failed to switch",
        description: "Could not switch to the selected organization",
        variant: "destructive",
      });
    }
  };

  const handleEnterPlatformMode = () => {
    enterPlatformMode();
    toast({
      title: "Platform Mode",
      description: "Exited tenant context. Now in Platform Command Center.",
    });
    setOpen(false);
  };

  // Only show for platform admins or users with multiple orgs
  if (!isPlatformAdmin && organizations.length <= 1 && !isPlatformMode) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "gap-2 w-full justify-start",
            isPlatformMode && "border-primary bg-primary/5"
          )}
        >
          {isPlatformMode ? (
            <>
              <Shield className="h-4 w-4 text-primary" />
              <span className="truncate">Platform Mode</span>
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4" />
              <span className="truncate">{organization?.name || 'Select Organization'}</span>
            </>
          )}
          <ChevronDown className="h-4 w-4 ml-auto shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Switch Organization
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Platform Mode option for platform admins */}
        {isPlatformAdmin && (
          <>
            <DropdownMenuItem
              onClick={handleEnterPlatformMode}
              className={cn(
                "gap-2 cursor-pointer",
                isPlatformMode && "bg-primary/10"
              )}
            >
              <Shield className="h-4 w-4 text-primary" />
              <div className="flex flex-col flex-1">
                <span className="font-medium">Platform Command Center</span>
                <span className="text-xs text-muted-foreground">
                  Manage all organizations
                </span>
              </div>
              {isPlatformMode && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Organization list */}
        {loading ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            Loading organizations...
          </div>
        ) : organizations.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No organizations found
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {organizations.map(({ organization: org, role }) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitchOrganization(org.id)}
                className={cn(
                  "gap-2 cursor-pointer",
                  organization?.id === org.id && !isPlatformMode && "bg-accent"
                )}
              >
                {org.logo_url ? (
                  <img 
                    src={org.logo_url} 
                    alt={org.name}
                    className="h-6 w-6 rounded object-contain"
                  />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium truncate">{org.name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {org.slug}.staymoxie.com
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {org.is_template_source && (
                    <Badge variant="outline" className="text-xs">Template</Badge>
                  )}
                  {organization?.id === org.id && !isPlatformMode && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrganizationSwitcher;
