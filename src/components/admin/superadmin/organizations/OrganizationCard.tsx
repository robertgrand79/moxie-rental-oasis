import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlatformOrganization, TemplateType } from '@/hooks/usePlatformAdmin';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  Users, 
  Home, 
  Globe,
  ChevronDown,
  ChevronUp,
  Eye,
  Mail,
  CreditCard,
  Calendar,
  DollarSign,
  Archive,
  Clock,
  Building,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import OrganizationActionsMenu from '../OrganizationActionsMenu';
import SubdomainSetupHelper from './SubdomainSetupHelper';

interface OrganizationCardProps {
  org: PlatformOrganization;
  isUpdating: boolean;
  toggleOrgStatus: (params: { orgId: string; isActive: boolean }) => void;
  toggleTemplateStatus: (params: { orgId: string; isTemplate: boolean }) => void;
  updateTemplateType: (params: { orgId: string; templateType: TemplateType }) => void;
  archiveOrganization: (params: { orgId: string; reason?: string }) => void;
  restoreOrganization: (orgId: string) => void;
  deleteOrganization: (orgId: string) => void;
  refetchOrgs?: () => void;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  org,
  isUpdating,
  toggleOrgStatus,
  toggleTemplateStatus,
  updateTemplateType,
  archiveOrganization,
  restoreOrganization,
  deleteOrganization,
  refetchOrgs
}) => {
  const navigate = useNavigate();
  const { switchOrganization } = useCurrentOrganization();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isExtendingTrial, setIsExtendingTrial] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  
  const isArchived = !!org.archived_at;

  // Fetch extended stats only when expanded
  const { data: extendedStats } = useQuery({
    queryKey: ['org-extended-stats', org.id],
    queryFn: async () => {
      // Get properties for this org
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('organization_id', org.id);
      
      const propertyIds = properties?.map(p => p.id) || [];
      
      // Get reservation stats
      let reservationStats = { total: 0, revenue: 0 };
      if (propertyIds.length > 0) {
        const { data: reservations } = await supabase
          .from('property_reservations')
          .select('id, total_amount, booking_status')
          .in('property_id', propertyIds);
        
        const confirmed = (reservations || []).filter(r => r.booking_status === 'confirmed');
        reservationStats = {
          total: reservations?.length || 0,
          revenue: confirmed.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0)
        };
      }

      // Get owner info
      const { data: members } = await supabase
        .from('organization_members')
        .select(`
          role,
          profiles:user_id (email, full_name)
        `)
        .eq('organization_id', org.id);
      
      const owner = members?.find((m: any) => m.role === 'owner');
      
      return {
        reservations: reservationStats.total,
        revenue: reservationStats.revenue,
        ownerEmail: (owner?.profiles as any)?.email || null,
        ownerName: (owner?.profiles as any)?.full_name || null
      };
    },
    enabled: isExpanded
  });

  const handleViewDashboard = async () => {
    setIsImpersonating(true);
    try {
      const success = await switchOrganization(org.id);
      if (success) {
        toast.success(`Switched to ${org.name}`);
        navigate('/admin');
      } else {
        toast.error('Failed to switch organization');
      }
    } catch (error) {
      toast.error('Failed to switch organization');
    } finally {
      setIsImpersonating(false);
    }
  };

  const handleEmailOwner = () => {
    if (extendedStats?.ownerEmail) {
      window.location.href = `mailto:${extendedStats.ownerEmail}`;
    } else {
      toast.error('No owner email found');
    }
  };

  const handleManageStripe = () => {
    if (org.stripe_customer_id) {
      window.open(`https://dashboard.stripe.com/customers/${org.stripe_customer_id}`, '_blank');
    } else {
      toast.info('No Stripe customer linked');
    }
  };

  const handleExtendTrial = async (days: number) => {
    setIsExtendingTrial(true);
    try {
      const newTrialEnd = addDays(new Date(), days);
      const { error } = await supabase
        .from('organizations')
        .update({ 
          trial_ends_at: newTrialEnd.toISOString(),
          subscription_status: 'trialing'
        })
        .eq('id', org.id);

      if (error) throw error;
      
      await refetchOrgs?.();
      toast.success(`Trial extended by ${days} days`);
    } catch (error) {
      toast.error('Failed to extend trial');
    } finally {
      setIsExtendingTrial(false);
    }
  };

  const handleProvisionSubdomain = async () => {
    if (!org?.slug) {
      toast.error('Organization slug is required for subdomain provisioning');
      return;
    }
    
    setIsProvisioning(true);
    try {
      const { data, error } = await supabase.functions.invoke('provision-subdomain', {
        body: {
          organization_id: org.id,
          slug: org.slug
        }
      });
      
      if (error) throw error;
      toast.success('Subdomain provisioned successfully');
      refetchOrgs?.();
    } catch (error) {
      console.error('Subdomain provisioning failed:', error);
      toast.error('Failed to provision subdomain');
    } finally {
      setIsProvisioning(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'trialing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
      case 'comped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200';
      case 'canceled':
      case 'past_due':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const primaryDomain = org.custom_domain || `${org.slug}.staymoxie.com`;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={`border rounded-lg transition-all ${isExpanded ? 'ring-2 ring-primary/20' : ''} ${isArchived ? 'opacity-60' : ''}`}>
        {/* Collapsed Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {org.logo_url ? (
                  <img src={org.logo_url} alt={org.name} className="h-8 w-8 object-contain rounded" />
                ) : (
                  <Building2 className="h-5 w-5 text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{org.name}</h3>
                  {isArchived && (
                    <Badge variant="outline" className="text-muted-foreground">
                      <Archive className="h-3 w-3 mr-1" />
                      Archived
                    </Badge>
                  )}
                  {org.is_template && (
                    <Badge variant="secondary" className="shrink-0">
                      {org.template_type === 'single_property' ? (
                        <Home className="h-3 w-3 mr-1" />
                      ) : (
                        <Building className="h-3 w-3 mr-1" />
                      )}
                      Template
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="truncate">{primaryDomain}</span>
                  {org.subdomain_status && (
                    <Badge variant={org.subdomain_status === 'active' ? 'default' : 'secondary'} className="shrink-0">
                      {org.subdomain_status === 'active' ? (
                        <Globe className="h-3 w-3 mr-1" />
                      ) : (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      )}
                      {org.subdomain_status}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1 shrink-0">
                    <Users className="h-3 w-3" />
                    {org.member_count}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Home className="h-3 w-3" />
                    {org.property_count}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Compact Subscription Status */}
              {!isArchived && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge className={getStatusColor(org.subscription_status)}>
                    {org.subscription_status || 'none'}
                  </Badge>
                  <Badge variant="outline">{org.subscription_tier || 'free'}</Badge>
                  {org.trial_ends_at && org.subscription_status === 'trialing' && (
                    <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(org.trial_ends_at), 'MMM d')}
                    </span>
                  )}
                </div>
              )}

              {/* Expand Indicator */}
              <div className="text-muted-foreground">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>

              {/* Actions Menu */}
              <OrganizationActionsMenu
                organizationId={org.id}
                organizationName={org.name}
                memberCount={org.member_count || 0}
                propertyCount={org.property_count || 0}
                isArchived={isArchived}
                onViewDetails={() => setIsExpanded(true)}
                onArchive={(reason) => archiveOrganization({ orgId: org.id, reason })}
                onRestore={() => restoreOrganization(org.id)}
                onDelete={() => deleteOrganization(org.id)}
                isLoading={isUpdating}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="border-t px-4 py-4 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Reservations</span>
                    </div>
                    <p className="text-lg font-semibold">{extendedStats?.reservations ?? '-'}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs">Revenue</span>
                    </div>
                    <p className="text-lg font-semibold">
                      ${(extendedStats?.revenue ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                {extendedStats?.ownerName && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="ml-2">{extendedStats.ownerName}</span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">{format(new Date(org.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleViewDashboard}
                    disabled={isImpersonating || isArchived}
                  >
                    {isImpersonating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    View Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEmailOwner}
                    disabled={!extendedStats?.ownerEmail}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Owner
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleManageStripe}
                    disabled={!org.stripe_customer_id}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Stripe
                  </Button>
                  <a
                    href={`https://${primaryDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Site
                    </Button>
                  </a>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleProvisionSubdomain}
                    disabled={isProvisioning || org.subdomain_status === 'active' || isArchived}
                  >
                    {isProvisioning ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    {org.subdomain_status === 'active' ? 'Subdomain Active' : 'Provision Subdomain'}
                  </Button>
                </div>
                {org.subdomain_error && (
                  <p className="text-xs text-destructive mt-1">{org.subdomain_error}</p>
                )}
                
                {/* Domain Registration Helper */}
                <SubdomainSetupHelper 
                  slug={org.slug}
                  subdomainStatus={org.subdomain_status}
                  customDomain={org.custom_domain}
                />
                
                {/* Trial Extension */}
                {org.subscription_status === 'trialing' && !isArchived && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-muted-foreground">Extend trial:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleExtendTrial(7)}
                      disabled={isExtendingTrial}
                      className="h-7 text-xs"
                    >
                      +7 days
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleExtendTrial(30)}
                      disabled={isExtendingTrial}
                      className="h-7 text-xs"
                    >
                      +30 days
                    </Button>
                  </div>
                )}
              </div>

              {/* Settings */}
              {!isArchived && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Active</label>
                      <Switch
                        checked={org.is_active}
                        onCheckedChange={(checked) => toggleOrgStatus({ orgId: org.id, isActive: checked })}
                        disabled={isUpdating}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Template Source</label>
                      <Switch
                        checked={org.is_template}
                        onCheckedChange={(checked) => toggleTemplateStatus({ orgId: org.id, isTemplate: checked })}
                        disabled={isUpdating}
                      />
                    </div>
                    {org.is_template && (
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Template Type</label>
                        <Select
                          value={org.template_type}
                          onValueChange={(value: TemplateType) => updateTemplateType({ orgId: org.id, templateType: value })}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single_property">
                              <span className="flex items-center gap-1">
                                <Home className="h-3 w-3" /> Single
                              </span>
                            </SelectItem>
                            <SelectItem value="multi_property">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" /> Multi
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default OrganizationCard;
