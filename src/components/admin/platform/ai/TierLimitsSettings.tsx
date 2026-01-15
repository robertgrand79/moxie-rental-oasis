import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePlatformAIUsage } from '@/hooks/usePlatformAIUsage';

const TierLimitsSettings = () => {
  const { tierLimits, tenantUsage } = usePlatformAIUsage();

  const tiers = [
    {
      name: 'Starter',
      key: 'starter',
      dailyLimit: tierLimits.starter,
      perMinuteLimit: 10,
      description: 'For new and trial organizations',
      color: 'bg-muted',
    },
    {
      name: 'Professional',
      key: 'professional',
      dailyLimit: tierLimits.professional,
      perMinuteLimit: 20,
      description: 'For growing vacation rental businesses',
      color: 'bg-blue-500/10',
    },
    {
      name: 'Portfolio',
      key: 'portfolio',
      dailyLimit: tierLimits.portfolio,
      perMinuteLimit: 30,
      description: 'For large property management companies',
      color: 'bg-purple-500/10',
    },
  ];

  const getTenantsOnTier = (tierKey: string) => {
    return tenantUsage?.filter(t => t.subscription_tier === tierKey).length || 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Tier Limits</CardTitle>
          <CardDescription>
            These limits are configured in the database function. Contact engineering to modify tier limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.key} className={tier.color}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                    <Badge variant="secondary">
                      {getTenantsOnTier(tier.key)} tenants
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Daily Limit</span>
                      <span className="font-medium">{tier.dailyLimit.toLocaleString()} requests</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Per Minute</span>
                      <span className="font-medium">{tier.perMinuteLimit} requests</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">{tier.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Overrides</CardTitle>
          <CardDescription>
            Organizations with custom daily limits. Use the Tenant Usage tab to set or remove overrides.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenantUsage?.filter(t => t.has_override).length === 0 ? (
            <p className="text-sm text-muted-foreground">No organizations have custom overrides.</p>
          ) : (
            <div className="space-y-2">
              {tenantUsage?.filter(t => t.has_override).map((tenant) => (
                <div
                  key={tenant.organization_id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{tenant.organization_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Tier: {tenant.subscription_tier} (default: {tierLimits[tenant.subscription_tier as keyof typeof tierLimits] || tierLimits.starter})
                    </p>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    Override: {tenant.override_limit} / day
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TierLimitsSettings;
