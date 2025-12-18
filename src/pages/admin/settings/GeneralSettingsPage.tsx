import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationOperations } from '@/hooks/useOrganizationOperations';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';

const GeneralSettingsPage = () => {
  const { organization, isOrgAdmin, loading, refetch } = useCurrentOrganization();
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      <SettingsSidebarLayout title="Organization" description="Manage your organization settings">
        <div className="text-center py-8">Loading organization...</div>
      </SettingsSidebarLayout>
    );
  }

  if (!organization) {
    return (
      <SettingsSidebarLayout title="Organization" description="Manage your organization settings">
        <Card>
          <CardHeader>
            <CardTitle>No Organization</CardTitle>
            <CardDescription>You don't belong to an organization yet.</CardDescription>
          </CardHeader>
        </Card>
      </SettingsSidebarLayout>
    );
  }

  return (
    <SettingsSidebarLayout title="Organization" description="Manage your organization settings">
      {/* Status indicators */}
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <Badge variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {organization.name}
        </Badge>
        <Badge variant={organization.subscription_status === 'active' ? 'default' : 'secondary'}>
          {organization.subscription_tier} - {organization.subscription_status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Update your organization information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
    </SettingsSidebarLayout>
  );
};

export default GeneralSettingsPage;
