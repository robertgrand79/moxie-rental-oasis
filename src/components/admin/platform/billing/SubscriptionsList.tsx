import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ExternalLink, Building2, Gift, Percent } from 'lucide-react';
import { usePlatformBilling } from '@/hooks/usePlatformBilling';
import { formatDistanceToNow, format, isBefore, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import CompAccountDialog from './CompAccountDialog';
import DiscountDialog from './DiscountDialog';

const SubscriptionsList = () => {
  const { subscriptions, loadingSubscriptions } = usePlatformBilling();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [compTarget, setCompTarget] = useState<{ id: string; name: string; tier: string | null; status: string | null; isComped: boolean } | null>(null);
  const [discountTarget, setDiscountTarget] = useState<{ id: string; name: string; discount: number | null; notes: string | null } | null>(null);

  const filteredSubscriptions = useMemo(() => {
    if (!subscriptions) return [];

    return subscriptions.filter(sub => {
      const matchesSearch = (sub.name?.toLowerCase() || '').includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sub.subscription_status === statusFilter;
      const matchesTier = tierFilter === 'all' || sub.subscription_tier === tierFilter;
      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [subscriptions, search, statusFilter, tierFilter]);

  const getStatusBadge = (status: string | null, trialEndsAt: string | null) => {
    const now = new Date();
    const isTrialEndingSoon = trialEndsAt && 
      status === 'trialing' && 
      isBefore(new Date(trialEndsAt), addDays(now, 7));

    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>;
      case 'trialing':
        return (
          <Badge className={isTrialEndingSoon 
            ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
            : "bg-blue-500/10 text-blue-600 border-blue-500/20"
          }>
            {isTrialEndingSoon ? 'Trial Ending' : 'Trialing'}
          </Badge>
        );
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      case 'comped':
        return <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20">Comped</Badge>;
      default:
        return <Badge variant="outline">None</Badge>;
    }
  };

  const uniqueStatuses = useMemo(() => {
    if (!subscriptions) return [];
    return [...new Set(subscriptions.map(s => s.subscription_status).filter(Boolean))];
  }, [subscriptions]);

  const uniqueTiers = useMemo(() => {
    if (!subscriptions) return [];
    return [...new Set(subscriptions.map(s => s.subscription_tier).filter(Boolean))];
  }, [subscriptions]);

  if (loadingSubscriptions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Subscriptions</CardTitle>
        <CardDescription>
          {filteredSubscriptions.length} of {subscriptions?.length || 0} organizations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status!}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {uniqueTiers.map(tier => (
                <SelectItem key={tier} value={tier!}>
                  {tier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Trial Ends</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{sub.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sub.subscription_status, sub.trial_ends_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline">{sub.subscription_tier || 'N/A'}</Badge>
                        {(sub as any).discount_percent && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                            {(sub as any).discount_percent}% off
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sub.trial_ends_at ? (
                        <span className="text-sm">
                          {format(new Date(sub.trial_ends_at), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Set Discount"
                          onClick={() => setDiscountTarget({
                            id: sub.id,
                            name: sub.name || 'Unknown',
                            discount: (sub as any).discount_percent || null,
                            notes: (sub as any).discount_notes || null,
                          })}
                        >
                          <Percent className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Comp Account"
                          onClick={() => setCompTarget({
                            id: sub.id,
                            name: sub.name || 'Unknown',
                            tier: sub.subscription_tier,
                            status: sub.subscription_status,
                            isComped: sub.subscription_status === 'comped',
                          })}
                        >
                          <Gift className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/platform/organizations?id=${sub.id}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {compTarget && (
        <CompAccountDialog
          open={!!compTarget}
          onOpenChange={(open) => !open && setCompTarget(null)}
          organizationId={compTarget.id}
          organizationName={compTarget.name}
          currentTier={compTarget.tier}
          currentStatus={compTarget.status}
          isCurrentlyComped={compTarget.isComped}
        />
      )}

      {discountTarget && (
        <DiscountDialog
          open={!!discountTarget}
          onOpenChange={(open) => !open && setDiscountTarget(null)}
          organizationId={discountTarget.id}
          organizationName={discountTarget.name}
          currentDiscount={discountTarget.discount}
          currentNotes={discountTarget.notes}
        />
      )}
    </Card>
  );
};

export default SubscriptionsList;
