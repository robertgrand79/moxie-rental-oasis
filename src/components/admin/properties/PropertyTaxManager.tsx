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
import { Receipt, Plus, Edit2, Trash2, Loader2, Percent, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PropertyTaxManagerProps {
  propertyId: string;
  organizationId: string;
}

interface TaxRate {
  id: string;
  jurisdiction: string;
  jurisdiction_type: string;
  tax_name: string;
  tax_rate: number;
  tax_type: string;
  flat_amount: number;
  applies_to: string;
  is_active: boolean;
  effective_from: string;
  effective_to: string | null;
}

interface PropertyTaxAssignment {
  id: string;
  tax_rate_id: string;
  is_active: boolean;
  tax_rates: TaxRate;
}

export const PropertyTaxManager: React.FC<PropertyTaxManagerProps> = ({ propertyId, organizationId }) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRate | null>(null);

  // Form state
  const [taxName, setTaxName] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [jurisdictionType, setJurisdictionType] = useState<'city' | 'county' | 'state' | 'federal'>('city');
  const [taxType, setTaxType] = useState<'percentage' | 'flat_per_night' | 'flat_per_booking'>('percentage');
  const [taxRate, setTaxRate] = useState(0);
  const [flatAmount, setFlatAmount] = useState(0);
  const [appliesTo, setAppliesTo] = useState<'accommodation_only' | 'subtotal' | 'total'>('total');

  // Fetch organization tax rates
  const { data: orgTaxRates = [], isLoading: loadingOrgRates } = useQuery({
    queryKey: ['org-tax-rates', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true);
      if (error) throw error;
      return data as TaxRate[];
    },
  });

  // Fetch property tax assignments
  const { data: propertyTaxes = [], isLoading: loadingPropertyTaxes } = useQuery({
    queryKey: ['property-taxes', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_tax_assignments')
        .select(`
          id,
          tax_rate_id,
          is_active,
          tax_rates (*)
        `)
        .eq('property_id', propertyId);
      if (error) throw error;
      return data as PropertyTaxAssignment[];
    },
  });

  const createTaxRate = useMutation({
    mutationFn: async () => {
      // Create tax rate
      const { data: newTax, error: taxError } = await supabase
        .from('tax_rates')
        .insert({
          organization_id: organizationId,
          jurisdiction,
          jurisdiction_type: jurisdictionType,
          tax_name: taxName,
          tax_rate: taxType === 'percentage' ? taxRate / 100 : 0,
          tax_type: taxType,
          flat_amount: taxType !== 'percentage' ? flatAmount : 0,
          applies_to: appliesTo,
          effective_from: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
      
      if (taxError) throw taxError;

      // Assign to property
      const { error: assignError } = await supabase
        .from('property_tax_assignments')
        .insert({
          property_id: propertyId,
          tax_rate_id: newTax.id,
          is_active: true,
        });
      
      if (assignError) throw assignError;
      return newTax;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-tax-rates'] });
      queryClient.invalidateQueries({ queryKey: ['property-taxes'] });
      toast({ title: 'Success', description: 'Tax rate created and assigned' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const assignExistingTax = useMutation({
    mutationFn: async (taxRateId: string) => {
      const { error } = await supabase
        .from('property_tax_assignments')
        .insert({
          property_id: propertyId,
          tax_rate_id: taxRateId,
          is_active: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-taxes'] });
      toast({ title: 'Success', description: 'Tax rate assigned to property' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleTaxAssignment = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('property_tax_assignments')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-taxes'] });
    },
  });

  const removeTaxAssignment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('property_tax_assignments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-taxes'] });
      toast({ title: 'Success', description: 'Tax removed from property' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setTaxName('');
    setJurisdiction('');
    setJurisdictionType('city');
    setTaxType('percentage');
    setTaxRate(0);
    setFlatAmount(0);
    setAppliesTo('total');
    setEditingTax(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const formatTaxDisplay = (tax: TaxRate) => {
    if (tax.tax_type === 'percentage') {
      return `${(tax.tax_rate * 100).toFixed(2)}%`;
    }
    return `$${tax.flat_amount.toFixed(2)} / ${tax.tax_type === 'flat_per_night' ? 'night' : 'booking'}`;
  };

  const getAppliesToLabel = (appliesTo: string) => {
    switch (appliesTo) {
      case 'accommodation_only': return 'Accommodation Only';
      case 'subtotal': return 'Subtotal (excl. service fee)';
      case 'total': return 'Total';
      default: return appliesTo;
    }
  };

  // Filter out already assigned taxes
  const assignedTaxIds = propertyTaxes.map(pt => pt.tax_rate_id);
  const availableTaxes = orgTaxRates.filter(t => !assignedTaxIds.includes(t.id));

  const isLoading = loadingOrgRates || loadingPropertyTaxes;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Tax Configuration
            </CardTitle>
            <CardDescription>
              Configure occupancy taxes and levies for this property
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tax
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Tax Rate</DialogTitle>
                <DialogDescription>
                  Create a new tax rate or select an existing one
                </DialogDescription>
              </DialogHeader>

              {availableTaxes.length > 0 && (
                <div className="space-y-3 pb-4 border-b">
                  <Label>Use Existing Tax Rate</Label>
                  <div className="space-y-2">
                    {availableTaxes.map(tax => (
                      <div
                        key={tax.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => assignExistingTax.mutate(tax.id)}
                      >
                        <div>
                          <p className="font-medium">{tax.tax_name}</p>
                          <p className="text-sm text-muted-foreground">{tax.jurisdiction}</p>
                        </div>
                        <Badge variant="outline">{formatTaxDisplay(tax)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <p className="text-sm font-medium text-muted-foreground">Or Create New</p>
                
                <div className="space-y-2">
                  <Label>Tax Name *</Label>
                  <Input
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    placeholder="e.g., City Occupancy Tax"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jurisdiction</Label>
                    <Input
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      placeholder="e.g., Austin, TX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={jurisdictionType} onValueChange={(v: any) => setJurisdictionType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="city">City</SelectItem>
                        <SelectItem value="county">County</SelectItem>
                        <SelectItem value="state">State</SelectItem>
                        <SelectItem value="federal">Federal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tax Type</Label>
                  <Select value={taxType} onValueChange={(v: any) => setTaxType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat_per_night">Flat Per Night ($)</SelectItem>
                      <SelectItem value="flat_per_booking">Flat Per Booking ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {taxType === 'percentage' ? (
                  <div className="space-y-2">
                    <Label>Rate (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={flatAmount}
                        onChange={(e) => setFlatAmount(parseFloat(e.target.value) || 0)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Applies To</Label>
                  <Select value={appliesTo} onValueChange={(v: any) => setAppliesTo(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accommodation_only">Accommodation Only</SelectItem>
                      <SelectItem value="subtotal">Subtotal (excl. service fee)</SelectItem>
                      <SelectItem value="total">Total (incl. all fees)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose what the tax percentage applies to
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button 
                  onClick={() => createTaxRate.mutate()}
                  disabled={!taxName.trim() || createTaxRate.isPending}
                >
                  {createTaxRate.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</>
                  ) : (
                    'Create Tax'
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
        ) : propertyTaxes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No taxes configured for this property</p>
            <p className="text-sm">Click "Add Tax" to configure occupancy taxes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {propertyTaxes.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{assignment.tax_rates.tax_name}</span>
                    <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                      {assignment.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {assignment.tax_rates.jurisdiction_type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatTaxDisplay(assignment.tax_rates)} • {assignment.tax_rates.jurisdiction}
                    <span className="ml-2">• Applies to: {getAppliesToLabel(assignment.tax_rates.applies_to)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={assignment.is_active}
                    onCheckedChange={(checked) => 
                      toggleTaxAssignment.mutate({ id: assignment.id, isActive: checked })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTaxAssignment.mutate(assignment.id)}
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
