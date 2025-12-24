import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Tag, Plus, Edit2, Trash2, Loader2, Percent, DollarSign, Copy, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface PromotionalCodesManagerProps {
  organizationId: string;
  propertyId?: string;
}

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_amount: number;
  min_nights: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  description: string | null;
  property_id: string | null;
}

export const PromotionalCodesManager: React.FC<PromotionalCodesManagerProps> = ({ 
  organizationId, 
  propertyId 
}) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [minNights, setMinNights] = useState(1);
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [validUntil, setValidUntil] = useState('');
  const [description, setDescription] = useState('');
  const [applyToProperty, setApplyToProperty] = useState(false);

  // Fetch promo codes
  const { data: promoCodes = [], isLoading } = useQuery({
    queryKey: ['promo-codes', organizationId, propertyId],
    queryFn: async () => {
      let query = supabase
        .from('promotional_codes')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (propertyId) {
        query = query.or(`property_id.is.null,property_id.eq.${propertyId}`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PromoCode[];
    },
  });

  const createPromoCode = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('promotional_codes')
        .insert({
          organization_id: organizationId,
          property_id: applyToProperty && propertyId ? propertyId : null,
          code: code.toUpperCase(),
          discount_type: discountType,
          discount_amount: discountAmount,
          min_nights: minNights,
          max_uses: maxUses || null,
          valid_until: validUntil || null,
          description: description || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({ title: 'Success', description: 'Promotional code created' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updatePromoCode = useMutation({
    mutationFn: async () => {
      if (!editingCode) return;
      const { error } = await supabase
        .from('promotional_codes')
        .update({
          code: code.toUpperCase(),
          discount_type: discountType,
          discount_amount: discountAmount,
          min_nights: minNights,
          max_uses: maxUses || null,
          valid_until: validUntil || null,
          description: description || null,
          property_id: applyToProperty && propertyId ? propertyId : null,
        })
        .eq('id', editingCode.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({ title: 'Success', description: 'Promotional code updated' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const togglePromoCode = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('promotional_codes')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });

  const deletePromoCode = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotional_codes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast({ title: 'Success', description: 'Promotional code deleted' });
    },
  });

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountAmount(0);
    setMinNights(1);
    setMaxUses('');
    setValidUntil('');
    setDescription('');
    setApplyToProperty(false);
    setEditingCode(null);
  };

  const handleOpenDialog = (promoCode?: PromoCode) => {
    if (promoCode) {
      setEditingCode(promoCode);
      setCode(promoCode.code);
      setDiscountType(promoCode.discount_type);
      setDiscountAmount(promoCode.discount_amount);
      setMinNights(promoCode.min_nights);
      setMaxUses(promoCode.max_uses || '');
      setValidUntil(promoCode.valid_until ? promoCode.valid_until.split('T')[0] : '');
      setDescription(promoCode.description || '');
      setApplyToProperty(!!promoCode.property_id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const copyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    toast({ title: 'Copied!', description: `Code "${codeStr}" copied to clipboard` });
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const isExpired = (promo: PromoCode) => {
    if (!promo.valid_until) return false;
    return new Date(promo.valid_until) < new Date();
  };

  const isMaxedOut = (promo: PromoCode) => {
    if (!promo.max_uses) return false;
    return promo.current_uses >= promo.max_uses;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Promotional Codes
            </CardTitle>
            <CardDescription>
              Create discount codes for guests
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCode ? 'Edit Promo Code' : 'Create Promo Code'}</DialogTitle>
                <DialogDescription>
                  Configure a discount code for your guests
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="SUMMER2024"
                      className="font-mono"
                    />
                    <Button type="button" variant="outline" onClick={generateRandomCode}>
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="flat">Flat Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      {discountType === 'percentage' ? (
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      ) : (
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      )}
                      <Input
                        type="number"
                        min="0"
                        max={discountType === 'percentage' ? 100 : undefined}
                        step={discountType === 'percentage' ? 1 : 0.01}
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min. Nights</Label>
                    <Input
                      type="number"
                      min="1"
                      value={minNights}
                      onChange={(e) => setMinNights(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Uses (optional)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expires On (optional)</Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {propertyId && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={applyToProperty}
                      onCheckedChange={setApplyToProperty}
                    />
                    <Label>Apply only to this property</Label>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Internal notes about this promo code..."
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button 
                  onClick={() => editingCode ? updatePromoCode.mutate() : createPromoCode.mutate()}
                  disabled={!code.trim() || createPromoCode.isPending || updatePromoCode.isPending}
                >
                  {(createPromoCode.isPending || updatePromoCode.isPending) ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                  ) : (
                    editingCode ? 'Update Code' : 'Create Code'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No promotional codes created</p>
            <p className="text-sm">Click "Create Code" to add a discount</p>
          </div>
        ) : (
          <div className="space-y-3">
            {promoCodes.map((promo) => (
              <div
                key={promo.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg">{promo.code}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyCode(promo.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Badge variant={promo.is_active && !isExpired(promo) && !isMaxedOut(promo) ? 'default' : 'secondary'}>
                      {isExpired(promo) ? 'Expired' : isMaxedOut(promo) ? 'Maxed Out' : promo.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {promo.property_id && (
                      <Badge variant="outline">Property Only</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {promo.discount_type === 'percentage' 
                      ? `${promo.discount_amount}% off` 
                      : `$${promo.discount_amount} off`}
                    {promo.min_nights > 1 && ` • Min ${promo.min_nights} nights`}
                    {promo.max_uses && ` • ${promo.current_uses}/${promo.max_uses} uses`}
                    {promo.valid_until && (
                      <span className="flex items-center gap-1 inline">
                        <Calendar className="h-3 w-3 ml-2" />
                        Expires {format(new Date(promo.valid_until), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={promo.is_active}
                    onCheckedChange={(checked) => togglePromoCode.mutate({ id: promo.id, isActive: checked })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(promo)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete this promotional code?')) {
                        deletePromoCode.mutate(promo.id);
                      }
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
