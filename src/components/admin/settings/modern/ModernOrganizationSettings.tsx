import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Globe, 
  Receipt, 
  Users, 
  Calendar, 
  RefreshCw,
  Save,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationOperations } from '@/hooks/useOrganizationOperations';
import DomainSettingsDrawer from './drawers/DomainSettingsDrawer';
import BillingSettingsDrawer from './drawers/BillingSettingsDrawer';
import { format } from 'date-fns';

const ModernOrganizationSettings: React.FC = () => {
  const { organization, isOrgAdmin, loading, refetch } = useCurrentOrganization();
  const { updateOrganization, updating } = useOrganizationOperations();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
  });

  const [domainDrawerOpen, setDomainDrawerOpen] = useState(false);
  const [billingDrawerOpen, setBillingDrawerOpen] = useState(false);

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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Organization</CardTitle>
          <CardDescription>You don't belong to an organization yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Stats
  const memberCount = 1; // Would come from org members query
  const createdDate = organization.created_at ? format(new Date(organization.created_at), 'MMM yyyy') : 'N/A';
  const hasCustomDomain = !!organization.custom_domain;
  const isSubscribed = ['active', 'trialing'].includes(organization.subscription_status || '');

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
            <p className="text-muted-foreground">{organization.slug}.staymoxie.com</p>
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDomainDrawerOpen(true)}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            Domain
            {hasCustomDomain && (
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Set
              </Badge>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setBillingDrawerOpen(true)}
            className="gap-2"
          >
            <Receipt className="h-4 w-4" />
            Billing
            <Badge variant={isSubscribed ? 'default' : 'secondary'} className="ml-1">
              {organization.subscription_tier || 'Free'}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Inline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{memberCount}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{createdDate}</p>
              <p className="text-xs text-muted-foreground">Active Since</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{hasCustomDomain ? '1' : '0'}</p>
              <p className="text-xs text-muted-foreground">Custom Domain</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold capitalize">{organization.subscription_status || 'Free'}</p>
              <p className="text-xs text-muted-foreground">Subscription</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Update your organization information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isOrgAdmin()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  disabled={!isOrgAdmin()}
                />
                <p className="text-xs text-muted-foreground">
                  Used for subdomain: {formData.slug}.staymoxie.com
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isOrgAdmin()}
              />
            </div>
            {isOrgAdmin() && (
              <Button type="submit" disabled={updating} className="gap-2">
                <Save className="h-4 w-4" />
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Drawers */}
      <DomainSettingsDrawer 
        open={domainDrawerOpen} 
        onOpenChange={setDomainDrawerOpen} 
      />
      <BillingSettingsDrawer 
        open={billingDrawerOpen} 
        onOpenChange={setBillingDrawerOpen} 
      />
    </div>
  );
};

export default ModernOrganizationSettings;
