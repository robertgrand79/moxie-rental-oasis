import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CreditCard, 
  Calendar, 
  Gift, 
  ArrowUpCircle, 
  ArrowDownCircle,
  XCircle,
  CheckCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { format, addDays } from 'date-fns';

interface SubscriptionControlsProps {
  organization: {
    id: string;
    name: string;
    subscription_status: string | null;
    subscription_tier: string | null;
    trial_ends_at: string | null;
    stripe_customer_id: string | null;
  };
  onUpdate: () => void;
}

const SubscriptionControls: React.FC<SubscriptionControlsProps> = ({ organization, onUpdate }) => {
  const { templates } = usePlatformSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTier, setSelectedTier] = useState(organization.subscription_tier || 'free');
  const [subscriptionStatus, setSubscriptionStatus] = useState(organization.subscription_status || 'trialing');
  const [trialDays, setTrialDays] = useState(14);
  const [isComped, setIsComped] = useState(organization.subscription_status === 'comped');

  const handleUpdateSubscription = async () => {
    setIsUpdating(true);
    try {
      const updates: Record<string, any> = {
        subscription_tier: selectedTier,
        subscription_status: isComped ? 'comped' : subscriptionStatus,
      };

      if (subscriptionStatus === 'trialing' && trialDays > 0) {
        updates.trial_ends_at = addDays(new Date(), trialDays).toISOString();
      }

      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);

      if (error) throw error;

      toast.success('Subscription updated');
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update subscription:', error);
      toast.error('Failed to update subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExtendTrial = async (days: number) => {
    setIsUpdating(true);
    try {
      const newTrialEnd = addDays(new Date(), days);
      const { error } = await supabase
        .from('organizations')
        .update({ 
          trial_ends_at: newTrialEnd.toISOString(),
          subscription_status: 'trialing'
        })
        .eq('id', organization.id);

      if (error) throw error;

      toast.success(`Trial extended by ${days} days`);
      onUpdate();
    } catch (error) {
      console.error('Failed to extend trial:', error);
      toast.error('Failed to extend trial');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickAction = async (action: 'activate' | 'cancel' | 'comp') => {
    setIsUpdating(true);
    try {
      let updates: Record<string, any> = {};
      
      switch (action) {
        case 'activate':
          updates = { subscription_status: 'active' };
          break;
        case 'cancel':
          updates = { subscription_status: 'canceled' };
          break;
        case 'comp':
          updates = { subscription_status: 'comped' };
          break;
      }

      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);

      if (error) throw error;

      toast.success('Subscription status updated');
      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'trialing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'comped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'canceled':
      case 'past_due':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={getStatusColor(organization.subscription_status)}>
          {organization.subscription_status || 'none'}
        </Badge>
        <Badge variant="outline">{organization.subscription_tier || 'free'}</Badge>
        {organization.trial_ends_at && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Trial ends {format(new Date(organization.trial_ends_at), 'MMM d, yyyy')}
          </span>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsOpen(true)}
          className="ml-2"
        >
          <CreditCard className="h-3 w-3 mr-1" />
          Manage
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Control subscription for {organization.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Status */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge className={getStatusColor(organization.subscription_status)}>
                  {organization.subscription_status || 'none'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Tier:</span>
                <span className="font-medium">{organization.subscription_tier || 'free'}</span>
              </div>
              {organization.stripe_customer_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stripe Customer:</span>
                  <span className="font-mono text-xs">{organization.stripe_customer_id}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExtendTrial(7)}
                  disabled={isUpdating}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  +7 Days Trial
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExtendTrial(30)}
                  disabled={isUpdating}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  +30 Days Trial
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction('activate')}
                  disabled={isUpdating}
                  className="text-green-600"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction('comp')}
                  disabled={isUpdating}
                  className="text-purple-600"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Comp Account
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction('cancel')}
                  disabled={isUpdating}
                  className="text-red-600 col-span-2"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </div>
            </div>

            {/* Manual Configuration */}
            <div className="space-y-4 border-t pt-4">
              <Label>Manual Configuration</Label>
              
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Subscription Tier</Label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    {templates?.map(template => (
                      <SelectItem key={template.id} value={template.slug}>
                        {template.name} (${(template.monthly_price_cents / 100).toFixed(2)}/mo)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="comped">Comped (Free)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {subscriptionStatus === 'trialing' && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Trial Duration (days)</Label>
                  <Input 
                    type="number" 
                    value={trialDays} 
                    onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                    min={0}
                    max={365}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubscription} disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionControls;
