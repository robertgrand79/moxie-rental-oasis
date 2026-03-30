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
import { Slider } from '@/components/ui/slider';
import { Percent, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
  currentDiscount?: number | null;
  currentNotes?: string | null;
}

const DiscountDialog: React.FC<DiscountDialogProps> = ({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  currentDiscount,
  currentNotes,
}) => {
  const queryClient = useQueryClient();
  const [percent, setPercent] = useState(currentDiscount || 10);
  const [notes, setNotes] = useState(currentNotes || '');
  const [saving, setSaving] = useState(false);

  const hasExistingDiscount = !!currentDiscount;

  const handleSetDiscount = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('organizations')
        .update({
          discount_percent: percent,
          discount_notes: notes || null,
          discount_set_by: user?.id || null,
          discount_set_at: new Date().toISOString(),
        } as any)
        .eq('id', organizationId);

      if (error) throw error;

      toast.success(`${percent}% discount set for ${organizationName}`);
      queryClient.invalidateQueries({ queryKey: ['platform-billing'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-detail'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error setting discount:', error);
      toast.error('Failed to set discount: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDiscount = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          discount_percent: null,
          discount_notes: null,
          discount_set_by: null,
          discount_set_at: null,
          stripe_coupon_id: null,
        } as any)
        .eq('id', organizationId);

      if (error) throw error;

      toast.success(`Discount removed from ${organizationName}`);
      queryClient.invalidateQueries({ queryKey: ['platform-billing'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-detail'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error removing discount:', error);
      toast.error('Failed to remove discount: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-amber-500" />
            {hasExistingDiscount ? 'Manage Discount' : 'Set Discount'}
          </DialogTitle>
          <DialogDescription>
            {hasExistingDiscount
              ? `${organizationName} currently has a ${currentDiscount}% discount applied.`
              : `Set a percentage discount for ${organizationName}. This will be applied as a Stripe coupon at checkout and on all renewals.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <Label>Discount Percentage</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[percent]}
                onValueChange={([val]) => setPercent(val)}
                min={1}
                max={100}
                step={1}
                className="flex-1"
              />
              <div className="flex items-center gap-1 min-w-[60px]">
                <Input
                  type="number"
                  value={percent}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= 100) setPercent(val);
                  }}
                  min={1}
                  max={100}
                  className="w-16 text-center"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="e.g., Partner rate, early adopter, referral bonus..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasExistingDiscount && (
            <Button
              variant="destructive"
              onClick={handleRemoveDiscount}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Remove Discount
            </Button>
          )}
          <Button
            onClick={handleSetDiscount}
            disabled={saving}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {hasExistingDiscount ? 'Update Discount' : 'Set Discount'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountDialog;
