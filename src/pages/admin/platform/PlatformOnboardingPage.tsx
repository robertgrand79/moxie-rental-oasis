import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlatformOnboarding, TenantHealth } from '@/hooks/usePlatformOnboarding';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, Users, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STAGE_LABELS: Record<string, string> = {
  signup_started: 'Signup Started',
  email_verified: 'Email Verified',
  org_created: 'Org Created',
  template_selected: 'Template Selected',
  first_property_added: 'First Property',
  guidebook_created: 'Guidebook Created',
  assistant_configured: 'Assistant Setup',
  first_booking: 'First Booking',
  completed: 'Completed',
};

const STAGE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', 
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'
];

function HealthBadge({ score }: { score: number }) {
  if (score >= 70) return <Badge className="bg-green-500">Healthy ({score})</Badge>;
  if (score >= 40) return <Badge className="bg-yellow-500">At Risk ({score})</Badge>;
  return <Badge variant="destructive">Critical ({score})</Badge>;
}

function FunnelChart({ data }: { data: { stage: string; org_count: number }[] }) {
  const chartData = data.map((d, i) => ({
    name: STAGE_LABELS[d.stage] || d.stage,
    value: d.org_count,
    fill: STAGE_COLORS[i % STAGE_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function StuckTenantsCard({ tenants }: { tenants: TenantHealth[] }) {
  if (tenants.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Stuck Tenants</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">No stuck tenants detected.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Stuck Tenants ({tenants.length})</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tenants.slice(0, 10).map((t) => (
            <div key={t.organization_id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div>
                <p className="font-medium">{t.organization_name}</p>
                <p className="text-sm text-muted-foreground">
                  Stuck at {STAGE_LABELS[t.current_stage] || t.current_stage} • {t.days_inactive} days inactive
                </p>
              </div>
              <HealthBadge score={t.health_score} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TenantHealthTable({ tenants }: { tenants: TenantHealth[] }) {
  return (
    <div className="rounded border overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-2">Organization</th>
            <th className="text-left p-2">Stage</th>
            <th className="text-left p-2">Health</th>
            <th className="text-left p-2">Last Active</th>
            <th className="text-left p-2">Setup</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.organization_id} className="border-t">
              <td className="p-2">
                <div className="font-medium">{t.organization_name}</div>
                <div className="text-xs text-muted-foreground">{t.slug}</div>
              </td>
              <td className="p-2">
                <Badge variant="outline">{STAGE_LABELS[t.current_stage] || t.current_stage}</Badge>
              </td>
              <td className="p-2"><HealthBadge score={t.health_score} /></td>
              <td className="p-2 text-muted-foreground">
                {t.last_activity_at ? formatDistanceToNow(new Date(t.last_activity_at), { addSuffix: true }) : 'Never'}
              </td>
              <td className="p-2">
                <div className="flex gap-1">
                  {t.has_properties ? <Badge variant="secondary" className="text-xs">Property</Badge> : null}
                  {t.has_guidebook ? <Badge variant="secondary" className="text-xs">Guide</Badge> : null}
                  {t.has_assistant ? <Badge variant="secondary" className="text-xs">AI</Badge> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PlatformOnboardingPage() {
  const { tenantHealth, funnel, stuckTenants, isLoading } = usePlatformOnboarding();

  const avgHealth = tenantHealth.length > 0 
    ? Math.round(tenantHealth.reduce((sum, t) => sum + t.health_score, 0) / tenantHealth.length) 
    : 0;
  const completedCount = tenantHealth.filter(t => t.onboarding_completed_at).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Onboarding Analytics</h1>
        <p className="text-muted-foreground">Track signup funnel, tenant health, and stuck users</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{tenantHealth.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{completedCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Completed Onboarding</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{avgHealth}</span>
            </div>
            <p className="text-sm text-muted-foreground">Avg Health Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold">{stuckTenants.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Stuck (3+ days)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnel">
        <TabsList>
          <TabsTrigger value="funnel">Signup Funnel</TabsTrigger>
          <TabsTrigger value="stuck">Stuck Tenants</TabsTrigger>
          <TabsTrigger value="health">All Tenants</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
            <CardContent>
              {funnel.length > 0 ? <FunnelChart data={funnel} /> : <p className="text-muted-foreground">No funnel data yet</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stuck" className="mt-4">
          <StuckTenantsCard tenants={stuckTenants} />
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Tenant Health Overview</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <p>Loading...</p> : <TenantHealthTable tenants={tenantHealth} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
