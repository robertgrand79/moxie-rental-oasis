import React, { useState, useEffect } from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationOperations } from '@/hooks/useOrganizationOperations';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, CreditCard, DollarSign, Building2, Shield, Crown, UserCog, MessageSquare, Lock, Plug, CheckCircle2, AlertCircle, Users, ExternalLink, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PriceLabsSettings } from '@/components/admin/settings/PriceLabsSettings';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import BillingSubscriptionTab from '@/components/admin/organization/BillingSubscriptionTab';

const AdminOrganization = () => {
  const { organization, membership, isPlatformAdmin, loading, isOrgAdmin, canManageOrganization, refetch } = useCurrentOrganization();
  const { updateOrganization, updating } = useOrganizationOperations();
  const { setApiKey, loading: savingKey } = useSecureApiKeys();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
    stripe_secret_key: '',
    stripe_publishable_key: '',
    stripe_webhook_secret: '',
    pricelabs_api_key: '',
    // Communications
    openphone_api_key: '',
    resend_api_key: '',
    // Smart Home
    seam_api_key: '',
    seam_webhook_secret: '',
    // Integrations
    turno_api_token: '',
    turno_api_secret: '',
    turno_partner_id: '',
    openweather_api_key: '',
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
        openphone_api_key: '',
        resend_api_key: '',
        seam_api_key: '',
        seam_webhook_secret: '',
        turno_api_token: '',
        turno_api_secret: '',
        turno_partner_id: '',
        openweather_api_key: '',
      });
    }
  }, [organization]);

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
    let success = true;
    if (formData.stripe_secret_key) success = await setApiKey(organization.id, 'stripe_secret_key', formData.stripe_secret_key) && success;
    if (formData.stripe_publishable_key) success = await setApiKey(organization.id, 'stripe_publishable_key', formData.stripe_publishable_key) && success;
    if (formData.stripe_webhook_secret) success = await setApiKey(organization.id, 'stripe_webhook_secret', formData.stripe_webhook_secret) && success;
    if (success) { setFormData(prev => ({ ...prev, stripe_secret_key: '', stripe_publishable_key: '', stripe_webhook_secret: '' })); refetch(); }
  };

  const handleUpdatePriceLabs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    if (formData.pricelabs_api_key) {
      const success = await setApiKey(organization.id, 'pricelabs_api_key', formData.pricelabs_api_key);
      if (success) { setFormData(prev => ({ ...prev, pricelabs_api_key: '' })); refetch(); }
    }
  };

  const handleUpdateCommunications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    let success = true;
    if (formData.openphone_api_key) success = await setApiKey(organization.id, 'openphone_api_key', formData.openphone_api_key) && success;
    if (formData.resend_api_key) success = await setApiKey(organization.id, 'resend_api_key', formData.resend_api_key) && success;
    if (success) { setFormData(prev => ({ ...prev, openphone_api_key: '', resend_api_key: '' })); refetch(); }
  };

  const handleUpdateSmartHome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    let success = true;
    if (formData.seam_api_key) success = await setApiKey(organization.id, 'seam_api_key', formData.seam_api_key) && success;
    if (formData.seam_webhook_secret) success = await setApiKey(organization.id, 'seam_webhook_secret', formData.seam_webhook_secret) && success;
    if (success) { setFormData(prev => ({ ...prev, seam_api_key: '', seam_webhook_secret: '' })); refetch(); }
  };

  const handleUpdateIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    let success = true;
    if (formData.turno_api_token) success = await setApiKey(organization.id, 'turno_api_token', formData.turno_api_token) && success;
    if (formData.turno_api_secret) success = await setApiKey(organization.id, 'turno_api_secret', formData.turno_api_secret) && success;
    if (formData.openweather_api_key) success = await setApiKey(organization.id, 'openweather_api_key', formData.openweather_api_key) && success;
    if (success) {
      await updateOrganization(organization.id, { turno_partner_id: formData.turno_partner_id || undefined });
      setFormData(prev => ({ ...prev, turno_api_token: '', turno_api_secret: '', openweather_api_key: '' }));
      refetch();
    }
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

  const ConfigStatus = ({ configured }: { configured: boolean }) => (
    <span className={`flex items-center gap-1 text-sm ${configured ? 'text-green-600' : 'text-muted-foreground'}`}>
      {configured ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Configured
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4" />
          Not configured
        </>
      )}
    </span>
  );

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

  // Type assertion to access new fields
  const org = organization as typeof organization & {
    openphone_api_key?: string;
    resend_api_key?: string;
    seam_api_key?: string;
    seam_webhook_secret?: string;
    turno_api_token?: string;
    turno_api_secret?: string;
    turno_partner_id?: string;
    openweather_api_key?: string;
  };

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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Stripe
            </TabsTrigger>
            <TabsTrigger value="pricelabs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              PriceLabs
            </TabsTrigger>
            <TabsTrigger value="communications" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="smarthome" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Smart Home
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrations
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

                {/* Link to User Management */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Members
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Manage team members, roles, and permissions
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link to="/admin/users" className="flex items-center gap-2">
                        User & Access Management
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <BillingSubscriptionTab />
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
                    <div className="mt-1">
                      <ConfigStatus configured={!!organization.stripe_secret_key} />
                    </div>
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
                    <div className="mt-1">
                      <ConfigStatus configured={!!organization.pricelabs_api_key} />
                    </div>
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

          <TabsContent value="communications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Communications Settings</CardTitle>
                <CardDescription>
                  Configure SMS (QUO) and Email (Resend) API keys for guest messaging.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateCommunications} className="space-y-4">
                  <div>
                    <Label htmlFor="openphone_api_key">QUO API Key</Label>
                    <Input
                      id="openphone_api_key"
                      type="password"
                      placeholder="Enter your QUO API key"
                      value={formData.openphone_api_key}
                      onChange={(e) => setFormData({ ...formData, openphone_api_key: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org.openphone_api_key} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Used for sending SMS messages to guests
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="resend_api_key">Resend API Key</Label>
                    <Input
                      id="resend_api_key"
                      type="password"
                      placeholder="re_..."
                      value={formData.resend_api_key}
                      onChange={(e) => setFormData({ ...formData, resend_api_key: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org.resend_api_key} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Used for sending transactional emails to guests
                    </p>
                  </div>
                  {isOrgAdmin() && (
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Saving...' : 'Update Communications Settings'}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smarthome" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Smart Home Settings (SEAM)</CardTitle>
                <CardDescription>
                  Configure SEAM API for smart lock access codes and device management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateSmartHome} className="space-y-4">
                  <div>
                    <Label htmlFor="seam_api_key">SEAM API Key</Label>
                    <Input
                      id="seam_api_key"
                      type="password"
                      placeholder="seam_..."
                      value={formData.seam_api_key}
                      onChange={(e) => setFormData({ ...formData, seam_api_key: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org.seam_api_key} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Used for managing smart locks and generating guest access codes
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="seam_webhook_secret">SEAM Webhook Secret</Label>
                    <Input
                      id="seam_webhook_secret"
                      type="password"
                      placeholder="Enter your SEAM webhook secret"
                      value={formData.seam_webhook_secret}
                      onChange={(e) => setFormData({ ...formData, seam_webhook_secret: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org.seam_webhook_secret} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Used for verifying webhook callbacks from SEAM
                    </p>
                  </div>
                  {isOrgAdmin() && (
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Saving...' : 'Update Smart Home Settings'}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Turno (Cleaning Service)</CardTitle>
                <CardDescription>
                  Configure Turno API for automated cleaning scheduling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateIntegrations} className="space-y-4">
                  <div>
                    <Label htmlFor="turno_api_token">Turno API Token</Label>
                    <Input
                      id="turno_api_token"
                      type="password"
                      placeholder="Enter your Turno API token"
                      value={formData.turno_api_token}
                      onChange={(e) => setFormData({ ...formData, turno_api_token: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org.turno_api_token} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="turno_api_secret">Turno API Secret</Label>
                    <Input
                      id="turno_api_secret"
                      type="password"
                      placeholder="Enter your Turno API secret"
                      value={formData.turno_api_secret}
                      onChange={(e) => setFormData({ ...formData, turno_api_secret: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org.turno_api_secret} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="turno_partner_id">Turno Partner ID</Label>
                    <Input
                      id="turno_partner_id"
                      placeholder="Enter your Turno partner ID"
                      value={formData.turno_partner_id}
                      onChange={(e) => setFormData({ ...formData, turno_partner_id: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org.turno_partner_id} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Optional - used for partner API access
                    </p>
                  </div>
                  {isOrgAdmin() && (
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Saving...' : 'Update Turno Settings'}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>OpenWeather (Weather Data)</CardTitle>
                <CardDescription>
                  Configure OpenWeather API for displaying local weather information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateIntegrations} className="space-y-4">
                  <div>
                    <Label htmlFor="openweather_api_key">OpenWeather API Key</Label>
                    <Input
                      id="openweather_api_key"
                      type="password"
                      placeholder="Enter your OpenWeather API key"
                      value={formData.openweather_api_key}
                      onChange={(e) => setFormData({ ...formData, openweather_api_key: e.target.value })}
                      disabled={!isOrgAdmin()}
                    />
                    <div className="mt-1">
                      <ConfigStatus configured={!!org.openweather_api_key} />
                    </div>
                  </div>
                  {isOrgAdmin() && (
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Saving...' : 'Update OpenWeather Settings'}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminOrganization;