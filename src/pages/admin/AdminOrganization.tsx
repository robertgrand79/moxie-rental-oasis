import React, { useState } from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { useOrganization } from '@/hooks/useOrganization';
import { useOrganizationOperations } from '@/hooks/useOrganizationOperations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Users, CreditCard, DollarSign } from 'lucide-react';

const AdminOrganization = () => {
  const { organization, loading, isOrgAdmin, refetch } = useOrganization();
  const { updateOrganization, updating } = useOrganizationOperations();
  
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    slug: organization?.slug || '',
    website: organization?.website || '',
    stripe_secret_key: '',
    stripe_publishable_key: '',
    stripe_webhook_secret: '',
    pricelabs_api_key: '',
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
                      {organization.stripe_secret_key ? 'Already configured' : 'Not configured'}
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

          <TabsContent value="pricelabs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>PriceLabs Integration</CardTitle>
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
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>Manage who has access to this organization</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Member management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminOrganization;
