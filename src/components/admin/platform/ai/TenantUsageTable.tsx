import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Settings2, X } from 'lucide-react';
import { usePlatformAIUsage, TenantAIUsage } from '@/hooks/usePlatformAIUsage';
import { useNavigate } from 'react-router-dom';

const TenantUsageTable = () => {
  const { tenantUsage, loadingTenantUsage, setOverride, isSettingOverride, tierLimits } = usePlatformAIUsage();
  const [searchQuery, setSearchQuery] = useState('');
  const [overrideDialog, setOverrideDialog] = useState<TenantAIUsage | null>(null);
  const [overrideValue, setOverrideValue] = useState('');
  const navigate = useNavigate();

  const filteredTenants = tenantUsage?.filter(t =>
    t.organization_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSetOverride = () => {
    if (!overrideDialog) return;
    const limit = overrideValue === '' ? null : parseInt(overrideValue, 10);
    setOverride({ organizationId: overrideDialog.organization_id, dailyLimit: limit });
    setOverrideDialog(null);
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'portfolio': return 'default';
      case 'professional': return 'secondary';
      default: return 'outline';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tenant AI Usage</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingTenantUsage ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Today's Usage</TableHead>
                <TableHead className="w-48">Progress</TableHead>
                <TableHead>30-Day Total</TableHead>
                <TableHead>Override</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No tenants found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => (
                  <TableRow 
                    key={tenant.organization_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/platform/organizations?id=${tenant.organization_id}`)}
                  >
                    <TableCell className="font-medium">{tenant.organization_name}</TableCell>
                    <TableCell>
                      <Badge variant={getTierBadgeVariant(tenant.subscription_tier)}>
                        {tenant.subscription_tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tenant.daily_used} / {tenant.daily_limit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div 
                            className={`h-full transition-all ${getUsageColor(tenant.usage_percentage)}`}
                            style={{ width: `${Math.min(tenant.usage_percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10">
                          {tenant.usage_percentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{tenant.total_requests_30d.toLocaleString()}</TableCell>
                    <TableCell>
                      {tenant.has_override ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          {tenant.override_limit}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOverrideDialog(tenant);
                          setOverrideValue(tenant.override_limit?.toString() || '');
                        }}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!overrideDialog} onOpenChange={() => setOverrideDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set AI Limit Override</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Override the daily AI limit for <strong>{overrideDialog?.organization_name}</strong>.
              Current tier ({overrideDialog?.subscription_tier}) default: {tierLimits[overrideDialog?.subscription_tier as keyof typeof tierLimits] || tierLimits.starter} requests/day.
            </p>
            <div className="space-y-2">
              <Label htmlFor="override-limit">Custom Daily Limit</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="override-limit"
                  type="number"
                  placeholder="Leave empty to use tier default"
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  min={0}
                />
                {overrideDialog?.has_override && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOverrideValue('')}
                    title="Remove override"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to remove override and use tier default.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleSetOverride} disabled={isSettingOverride}>
              {isSettingOverride ? 'Saving...' : 'Save Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TenantUsageTable;
