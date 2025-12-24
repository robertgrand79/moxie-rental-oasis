import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { CalendarDays, Plus, Trash2, Loader2, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LengthOfStayDiscountsProps {
  propertyId: string;
}

interface LOSDiscount {
  id: string;
  min_nights: number;
  discount_percentage: number;
  is_active: boolean;
}

export const LengthOfStayDiscounts: React.FC<LengthOfStayDiscountsProps> = ({ propertyId }) => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newMinNights, setNewMinNights] = useState(7);
  const [newDiscountPercent, setNewDiscountPercent] = useState(10);

  // Fetch discounts
  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['los-discounts', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('length_of_stay_discounts')
        .select('*')
        .eq('property_id', propertyId)
        .order('min_nights', { ascending: true });
      if (error) throw error;
      return data as LOSDiscount[];
    },
  });

  const createDiscount = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('length_of_stay_discounts')
        .insert({
          property_id: propertyId,
          min_nights: newMinNights,
          discount_percentage: newDiscountPercent,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['los-discounts'] });
      toast({ title: 'Success', description: 'Length of stay discount added' });
      setIsAdding(false);
      setNewMinNights(7);
      setNewDiscountPercent(10);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleDiscount = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('length_of_stay_discounts')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['los-discounts'] });
    },
  });

  const deleteDiscount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('length_of_stay_discounts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['los-discounts'] });
      toast({ title: 'Success', description: 'Discount removed' });
    },
  });

  const getDiscountLabel = (minNights: number) => {
    if (minNights >= 28) return 'Monthly';
    if (minNights >= 7) return 'Weekly';
    return `${minNights}+ nights`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Length of Stay Discounts
            </CardTitle>
            <CardDescription>
              Automatically apply discounts for longer bookings
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Discount
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-4 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Minimum Nights</Label>
                <Input
                  type="number"
                  min="2"
                  value={newMinNights}
                  onChange={(e) => setNewMinNights(parseInt(e.target.value) || 2)}
                />
                <p className="text-xs text-muted-foreground">
                  Discount applies for stays of this length or longer
                </p>
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    max="90"
                    value={newDiscountPercent}
                    onChange={(e) => setNewDiscountPercent(parseInt(e.target.value) || 1)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => createDiscount.mutate()}
                disabled={createDiscount.isPending}
              >
                {createDiscount.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Adding...</>
                ) : (
                  'Add Discount'
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : discounts.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No length of stay discounts configured</p>
            <p className="text-sm">Add discounts to encourage longer bookings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {discounts.map((discount) => (
              <div
                key={discount.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-2xl font-bold">{discount.min_nights}+</div>
                    <div className="text-xs text-muted-foreground">nights</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg text-primary">
                        {discount.discount_percentage}% off
                      </span>
                      <Badge variant={discount.is_active ? 'default' : 'secondary'}>
                        {discount.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{getDiscountLabel(discount.min_nights)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Guests save {discount.discount_percentage}% on stays of {discount.min_nights} nights or more
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={discount.is_active}
                    onCheckedChange={(checked) => toggleDiscount.mutate({ id: discount.id, isActive: checked })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete this discount?')) {
                        deleteDiscount.mutate(discount.id);
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

        {discounts.length > 0 && (
          <p className="text-xs text-muted-foreground mt-4">
            When multiple discounts apply, the highest applicable discount is used
          </p>
        )}
      </CardContent>
    </Card>
  );
};
