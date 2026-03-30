import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Gift, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface CompAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
  currentTier?: string | null;
  currentStatus?: string | null;
  isCurrentlyComped?: boolean;
}

const TIERS = [
  { value: 'starter', label: 'Starter', description: '$79/mo — 1 property' },
  { value: 'professional', label: 'Professional', description: '$179/mo — up to 5 properties' },
  { value: 'portfolio', label: 'Portfolio', description: '$299/mo — unlimited properties' },
];

const CompAccountDialog: React.FC<CompAccountDialogProps> = ({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  currentTier,
  currentStatus,
  isCurrentlyComped,
}) => {
  const queryClient = useQueryClient();
  const [tier, setTier] = useState(currentTier || 'professional');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleComp = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('organizations')
        .update({
          is_comped: true,
          comped_tier: tier,
          comped_until: hasExpiration && expirationDate ? new Date(expirationDate).toISOString() : null,
          comped_by: user?.id || null,
          comped_at: new Date().toISOString(),
          comp_notes: notes || null,
          // Override the actual subscription fields
          subscription_tier: tier,
          subscription_status: 'comped',
        } as any)
        .eq('id', organizationId);

      if (error) throw error;

      toast.success(`${organizationName} has been comped to ${tier}`);
      queryClient.invalidateQueries({ queryKey: ['platform-billing'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-detail'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error comping account:', error);
      toast.error('Failed to comp account: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveComp = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          is_comped: false,
          comped_tier: null,
          comped_until: null,
          comp_notes: null,
          subscription_status: 'inactive',
          subscription_tier: 'starter',
        } as any)
        .eq('id', organizationId);

      if (error) throw error;

      toast.success(`Comp removed from ${organizationName}`);
      queryClient.invalidateQueries({ queryKey: ['platform-billing'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-detail'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error removing comp:', error);
      toast.error('Failed to remove comp: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-violet-500" />
            {isCurrentlyComped ? 'Manage Comp' : 'Comp Account'}
          </DialogTitle>
          <DialogDescription>
            {isCurrentlyComped 
              ? `${organizationName} is currently comped on the ${currentTier} tier.`
              : `Override the subscription tier for ${organizationName} without requiring payment.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Subscription Tier</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIERS.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex flex-col">
                      <span>{t.label}</span>
                      <span className="text-xs text-muted-foreground">{t.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="has-expiration">Set expiration date</Label>
            <Switch
              id="has-expiration"
              checked={hasExpiration}
              onCheckedChange={setHasExpiration}
            />
          </div>

          {hasExpiration && (
            <div className="space-y-2">
              <Label>Expires on</Label>
              <Input
                type="date"
                value={expirationDate}
                onChange={e => setExpirationDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="e.g., Partner account, beta tester, promotional..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isCurrentlyComped && (
            <Button
              variant="destructive"
              onClick={handleRemoveComp}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Remove Comp
            </Button>
          )}
          <Button
            onClick={handleComp}
            disabled={saving}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isCurrentlyComped ? 'Update Comp' : 'Comp Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompAccountDialog;
