import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationOperations } from '@/hooks/useOrganizationOperations';
import { PriceLabsSettings } from '@/components/admin/settings/PriceLabsSettings';

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

const PaymentsSettingsPanel = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { updateOrganization, updating } = useOrganizationOperations();
  
  const [formData, setFormData] = useState({
    stripe_secret_key: '',
    stripe_publishable_key: '',
    stripe_webhook_secret: '',
    pricelabs_api_key: '',
  });

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

  if (!organization) {
    return <div className="text-center py-8">No organization found</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="stripe" className="w-full">
        <TabsList>
          <TabsTrigger value="stripe" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="pricelabs" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            PriceLabs
          </TabsTrigger>
        </TabsList>

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
                Configure PriceLabs API key for dynamic pricing sync across all properties.
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
      </Tabs>
    </div>
  );
};

export default PaymentsSettingsPanel;
