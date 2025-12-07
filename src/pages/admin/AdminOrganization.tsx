import React, { useState, useEffect } from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationOperations } from '@/hooks/useOrganizationOperations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, CreditCard, DollarSign, Building2, Shield, Crown, UserCog } from 'lucide-react';
import { PriceLabsSettings } from '@/components/admin/settings/PriceLabsSettings';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const AdminOrganization = () => {
  const { organization, membership, isPlatformAdmin, loading, isOrgAdmin, canManageOrganization, refetch } = useCurrentOrganization();
  const { updateOrganization, updating } = useOrganizationOperations();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
    stripe_secret_key: '',
    stripe_publishable_key: '',
    stripe_webhook_secret: '',
    pricelabs_api_key: '',
  });

  // Initialize form data when organization loads
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        slug: organization.slug || '',
        website: organization.website || '',
        stripe_secret_key: '',
        stripe_publishable_key: '',
        stripe_webhook_secret: '',
        pricelabs_api_key: '',
      });
    }
  }, [organization]);

  // Fetch organization members
  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['organization-members', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profile:profiles(id, email, full_name, avatar_url)
        `)
        .eq('organization_id', organization.id)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!organization?.id,
  });

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    await updateOrganization(organization.id, {
      name: formData.name,
      slug: formData.slug,
      website: formData.website,
    });
    refetch();
  };

  const handleUpdateStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    await updateOrganization(organization.id, {
      stripe_secret_key: formData.stripe_secret_key || undefined,
      stripe_publishable_key: formData.stripe_publishable_key || undefined,
      stripe_webhook_secret: formData.stripe_webhook_secret || undefined,
    });
    refetch();
  };

  const handleUpdatePriceLabs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    await updateOrganization(organization.id, {
      pricelabs_api_key: formData.pricelabs_api_key || undefined,
    });
    refetch();
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline'; icon: React.ReactNode }> = {
      owner: { variant: 'default', icon: <Crown className="h-3 w-3 mr-1" /> },
      admin: { variant: 'secondary', icon: <Shield className="h-3 w-3 mr-1" /> },
      member: { variant: 'outline', icon: <UserCog className="h-3 w-3 mr-1" /> },
    };
    const config = variants[role] || variants.member;
    return (
      <Badge variant={config.variant} className="flex items-center">
        {config.icon}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <AdminPageWrapper title="Organization Settings" description="Manage your organization">
        <div className="p-8">
          <div className="text-center py-8">Loading organization...</div>
        </div>
      </AdminPageWrapper>
    );
  }

  if (!organization) {
    return (
      <AdminPageWrapper title="Organization Settings" description="Manage your organization">
        <div className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>No Organization</CardTitle>
              <CardDescription>You don't belong to an organization yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contact your administrator to be added to an organization.</p>
            </CardContent>
          </Card>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper 
      title="Organization Settings" 
      description={`Manage ${organization.name}`}
    >
      <div className="p-8">
        {/* Status indicators */}
        <div className="flex items-center gap-4 mb-6">
          <Badge variant="outline" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {organization.name}
          </Badge>
          {membership && getRoleBadge(membership.role)}
          {isPlatformAdmin && (
            <Badge variant="destructive" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Platform Admin
            </Badge>
          )}
          <Badge variant={organization.subscription_status === 'active' ? 'default' : 'secondary'}>
            {organization.subscription_tier} - {organization.subscription_status}
          </Badge>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Stripe
            </TabsTrigger>
            <TabsTrigger value="pricelabs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              PriceLabs
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Update your organization information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateGeneral} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Used for subdomain routing (e.g., {formData.slug}.yourdomain.com)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                  </div>
                  {isOrgAdmin() && (
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stripe" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization-Wide Stripe Configuration</CardTitle>
                <CardDescription>
                  Configure a single Stripe account for all properties in this organization.
                  Leave blank to use per-property Stripe accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateStripe} className="space-y-4">
                  <div>
                    <Label htmlFor="stripe_secret_key">Stripe Secret Key</Label>
                    <Input
                      id="stripe_secret_key"
                      type="password"
                      placeholder="sk_live_..."
                      value={formData.stripe_secret_key}
                      onChange={(e) => setFormData({ ...formData, stripe_secret_key: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {organization.stripe_secret_key ? '✓ Already configured' : 'Not configured'}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="stripe_publishable_key">Stripe Publishable Key</Label>
                    <Input
                      id="stripe_publishable_key"
                      placeholder="pk_live_..."
                      value={formData.stripe_publishable_key}
                      onChange={(e) => setFormData({ ...formData, stripe_publishable_key: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stripe_webhook_secret">Stripe Webhook Secret</Label>
                    <Input
                      id="stripe_webhook_secret"
                      type="password"
                      placeholder="whsec_..."
                      value={formData.stripe_webhook_secret}
                      onChange={(e) => setFormData({ ...formData, stripe_webhook_secret: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                  </div>
                  {isOrgAdmin() && (
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Saving...' : 'Update Stripe Settings'}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricelabs" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PriceLabs API Key</CardTitle>
                <CardDescription>
                  Configure PriceLabs API key for dynamic pricing sync across all properties in this organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePriceLabs} className="space-y-4">
                  <div>
                    <Label htmlFor="pricelabs_api_key">PriceLabs API Key</Label>
                    <Input
                      id="pricelabs_api_key"
                      type="password"
                      placeholder="Enter your PriceLabs API key"
                      value={formData.pricelabs_api_key}
                      onChange={(e) => setFormData({ ...formData, pricelabs_api_key: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {organization.pricelabs_api_key ? '✓ Already configured' : 'Not configured - using global key if available'}
                    </p>
                  </div>
                  {isOrgAdmin() && (
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Saving...' : 'Update PriceLabs Settings'}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
            
            <PriceLabsSettings />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>
                  {members?.length || 0} member{members?.length !== 1 ? 's' : ''} in this organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="text-center py-4">Loading members...</div>
                ) : members && members.length > 0 ? (
                  <div className="space-y-4">
                    {members.map((member: any) => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {member.profile?.full_name?.charAt(0)?.toUpperCase() || member.profile?.email?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{member.profile?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getRoleBadge(member.role)}
                          <span className="text-sm text-muted-foreground">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No members found</p>
                )}
                
                {canManageOrganization() && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground">
                      Invite new members feature coming soon...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminOrganization;
