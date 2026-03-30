import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Building2, 
  Users, 
  Home, 
  Calendar, 
  DollarSign,
  Mail,
  Phone,
  Globe,
  Clock,
  Activity,
  CreditCard,
  Eye,
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import SubdomainSetupHelper from './organizations/SubdomainSetupHelper';
import CompAccountDialog from '@/components/admin/platform/billing/CompAccountDialog';

interface TenantDetailViewProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TenantDetailView = ({ organizationId, open, onOpenChange }: TenantDetailViewProps) => {
  const navigate = useNavigate();
  const { switchOrganization } = useCurrentOrganization();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [showCompDialog, setShowCompDialog] = useState(false);

  // Handle View As Tenant - switch to this organization
  const handleViewAsTenant = async () => {
    if (!org) return;
    
    setIsImpersonating(true);
    try {
      const success = await switchOrganization(organizationId);
      if (success) {
        toast.success(`Switched to ${org.name}`);
        onOpenChange(false);
        navigate('/admin');
      } else {
        toast.error('Failed to switch organization');
      }
    } catch (error) {
      console.error('Error switching organization:', error);
      toast.error('Failed to switch organization');
    } finally {
      setIsImpersonating(false);
    }
  };

  // Handle Send Email - find owner email
  const handleSendEmail = () => {
    // Cast to any to handle runtime data structure
    const owner = (members as any[]).find((m) => m.role === 'owner');
    const email = owner?.profiles?.email;
    if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      toast.error('No owner email found');
    }
  };

  // Handle Manage Subscription - navigate to subscription controls or Stripe
  const handleManageSubscription = () => {
    if (org?.stripe_customer_id) {
      // Open Stripe dashboard for this customer
      window.open(`https://dashboard.stripe.com/customers/${org.stripe_customer_id}`, '_blank');
    } else {
      toast.info('No Stripe customer linked to this organization');
    }
  };

  // Handle provision subdomain for legacy tenants
  const handleProvisionSubdomain = async () => {
    if (!org?.slug) {
      toast.error('Organization slug is required for subdomain provisioning');
      return;
    }
    
    setIsProvisioning(true);
    try {
      const { data, error } = await supabase.functions.invoke('provision-subdomain', {
        body: {
          organization_id: organizationId,
          slug: org.slug,
        },
      });

      if (error) throw error;
      
      toast.success('Subdomain provisioning initiated');
      // Refetch will happen automatically via react-query
    } catch (error) {
      console.error('Subdomain provisioning failed:', error);
      toast.error('Failed to provision subdomain');
    } finally {
      setIsProvisioning(false);
    }
  };
  // Fetch organization details
  const { data: org, isLoading: loadingOrg } = useQuery({
    queryKey: ['tenant-detail', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: open && !!organizationId,
  });

  // Fetch members
  const { data: members = [] } = useQuery({
    queryKey: ['tenant-members', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            last_login_at
          )
        `)
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!organizationId,
  });

  // Fetch properties
  const { data: properties = [] } = useQuery({
    queryKey: ['tenant-properties', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, created_at')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!organizationId,
  });

  // Fetch reservation stats
  const { data: reservationStats } = useQuery({
    queryKey: ['tenant-reservations', organizationId],
    queryFn: async () => {
      const propertyIds = properties.map(p => p.id);
      if (propertyIds.length === 0) return { count: 0, revenue: 0 };
      
      const { data, error } = await supabase
        .from('property_reservations')
        .select('id, total_amount, booking_status')
        .in('property_id', propertyIds);
      
      if (error) throw error;
      
      const confirmed = (data || []).filter(r => r.booking_status === 'confirmed');
      return {
        total: data?.length || 0,
        confirmed: confirmed.length,
        revenue: confirmed.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0)
      };
    },
    enabled: open && properties.length > 0,
  });

  // Fetch recent activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['tenant-activity', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!organizationId,
  });

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {org?.logo_url ? (
              <img src={org.logo_url} alt={org?.name} className="h-8 w-8 rounded object-contain" />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <span>{org?.name || 'Loading...'}</span>
              <div className="flex items-center gap-2 mt-1">
                {org?.is_active ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="destructive">Inactive</Badge>
                )}
                {org?.subscription_status && (
                  <Badge variant="outline">{org.subscription_status}</Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              <TabsTrigger value="properties">Properties ({properties.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Members</p>
                        <p className="text-2xl font-bold">{members.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Properties</p>
                        <p className="text-2xl font-bold">{properties.length}</p>
                      </div>
                      <Home className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Reservations</p>
                        <p className="text-2xl font-bold">{reservationStats?.total || 0}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold">${(reservationStats?.revenue || 0).toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Organization Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Slug:</span>
                    <span className="ml-2 font-mono">{org?.slug}</span>
                  </div>
                  {org?.custom_domain && (
                    <div>
                      <span className="text-muted-foreground">Custom Domain:</span>
                      <span className="ml-2">{org.custom_domain}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2">{org?.created_at ? format(new Date(org.created_at), 'MMM d, yyyy') : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Template Type:</span>
                    <span className="ml-2">{org?.template_type}</span>
                  </div>
                  {org?.trial_ends_at && (
                    <div>
                      <span className="text-muted-foreground">Trial Ends:</span>
                      <span className="ml-2">{format(new Date(org.trial_ends_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {org?.stripe_customer_id && (
                    <div>
                      <span className="text-muted-foreground">Stripe Customer:</span>
                      <span className="ml-2 font-mono text-xs">{org.stripe_customer_id}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Subdomain Status:</span>
                    <Badge 
                      className="ml-2" 
                      variant={
                        org?.subdomain_status === 'active' ? 'default' : 
                        org?.subdomain_status === 'failed' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {org?.subdomain_status || 'pending'}
                    </Badge>
                  </div>
                  {org?.subdomain_error && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Subdomain Error:</span>
                      <span className="ml-2 text-destructive text-xs">{org.subdomain_error}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Domain Setup */}
              {org?.slug && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Domain Setup</CardTitle>
                    <CardDescription>
                      Subdomain registration status and Lovable configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubdomainSetupHelper 
                      slug={org.slug}
                      subdomainStatus={org.subdomain_status}
                      customDomain={org.custom_domain}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleViewAsTenant}
                    disabled={isImpersonating}
                  >
                    {isImpersonating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    View As Tenant
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSendEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCompDialog(true)}
                    className={org?.subscription_status === 'comped' ? 'border-violet-500/30 text-violet-600' : ''}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    {org?.subscription_status === 'comped' ? 'Manage Comp' : 'Comp Account'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleProvisionSubdomain}
                    disabled={isProvisioning || org?.subdomain_status === 'active'}
                  >
                    {isProvisioning ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    {org?.subdomain_status === 'active' ? 'Subdomain Active' : 'Provision Subdomain'}
                  </Button>
                </CardContent>
              </Card>

              {showCompDialog && org && (
                <CompAccountDialog
                  open={showCompDialog}
                  onOpenChange={setShowCompDialog}
                  organizationId={organizationId}
                  organizationName={org.name || 'Unknown'}
                  currentTier={org.subscription_tier}
                  currentStatus={org.subscription_status}
                  isCurrentlyComped={org.subscription_status === 'comped'}
                />
              )}
            </TabsContent>

            <TabsContent value="members" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {members.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{member.role}</Badge>
                          {member.profiles?.last_login_at && (
                            <span className="text-xs text-muted-foreground">
                              Last login: {format(new Date(member.profiles.last_login_at), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {members.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No members found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {properties.map((property: any) => (
                      <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Created: {format(new Date(property.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge variant="outline">Property</Badge>
                      </div>
                    ))}
                    {properties.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No properties found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {recentActivity.map((activity: any) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TenantDetailView;
