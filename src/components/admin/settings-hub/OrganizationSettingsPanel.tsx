import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Settings, Receipt } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationOperations } from '@/hooks/useOrganizationOperations';
import BillingSubscriptionTab from '@/components/admin/organization/BillingSubscriptionTab';

const OrganizationSettingsPanel = () => {
  const { organization, membership, isPlatformAdmin, loading, isOrgAdmin, refetch } = useCurrentOrganization();
  const { updateOrganization, updating } = useOrganizationOperations();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        slug: organization.slug || '',
        website: organization.website || '',
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

  if (loading) {
    return (
      <div className="text-center py-8">Loading organization...</div>
    );
  }

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Organization</CardTitle>
          <CardDescription>You don't belong to an organization yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Contact your administrator to be added to an organization.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status indicators */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {organization.name}
        </Badge>
        <Badge variant={organization.subscription_status === 'active' ? 'default' : 'secondary'}>
          {organization.subscription_tier} - {organization.subscription_status}
        </Badge>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Billing & Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
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

        <TabsContent value="billing" className="mt-6">
          <BillingSubscriptionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationSettingsPanel;
