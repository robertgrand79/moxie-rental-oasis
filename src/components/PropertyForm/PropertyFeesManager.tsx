import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/property';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { usePropertyFees, CreatePropertyFee, PropertyFee } from '@/hooks/usePropertyFees';
import { DollarSign, Plus, Trash2, Edit2, Loader2, Percent, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface PropertyFeesManagerProps {
  property: Property;
}

export const PropertyFeesManager: React.FC<PropertyFeesManagerProps> = ({ property }) => {
  const queryClient = useQueryClient();
  const { fees, isLoading, createFee, updateFee, deleteFee } = usePropertyFees(property.id);
  
  const [cleaningFee, setCleaningFee] = useState<number>(property.cleaning_fee || 0);
  const [serviceFeePercentage, setServiceFeePercentage] = useState<number>(property.service_fee_percentage || 0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<PropertyFee | null>(null);
  
  // New fee form state
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeType, setNewFeeType] = useState<'flat' | 'percentage'>('flat');
  const [newFeeAmount, setNewFeeAmount] = useState<number>(0);
  const [newFeeAppliesTo, setNewFeeAppliesTo] = useState<'booking' | 'per_night' | 'per_guest'>('booking');
  const [newFeeDescription, setNewFeeDescription] = useState('');

  const updateStandardFees = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('properties')
        .update({
          cleaning_fee: cleaningFee,
          service_fee_percentage: serviceFeePercentage,
        })
        .eq('id', property.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Success',
        description: 'Standard fees updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update fees: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setNewFeeName('');
    setNewFeeType('flat');
    setNewFeeAmount(0);
    setNewFeeAppliesTo('booking');
    setNewFeeDescription('');
    setEditingFee(null);
  };

  const handleOpenDialog = (fee?: PropertyFee) => {
    if (fee) {
      setEditingFee(fee);
      setNewFeeName(fee.fee_name);
      setNewFeeType(fee.fee_type);
      setNewFeeAmount(fee.fee_amount);
      setNewFeeAppliesTo(fee.fee_applies_to);
      setNewFeeDescription(fee.description || '');
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSaveFee = async () => {
    if (!newFeeName.trim()) {
      toast({
        title: 'Error',
        description: 'Fee name is required',
        variant: 'destructive',
      });
      return;
    }

    if (editingFee) {
      await updateFee.mutateAsync({
        id: editingFee.id,
        fee_name: newFeeName,
        fee_type: newFeeType,
        fee_amount: newFeeAmount,
        fee_applies_to: newFeeAppliesTo,
        description: newFeeDescription || undefined,
      });
    } else {
      await createFee.mutateAsync({
        property_id: property.id,
        fee_name: newFeeName,
        fee_type: newFeeType,
        fee_amount: newFeeAmount,
        fee_applies_to: newFeeAppliesTo,
        description: newFeeDescription || undefined,
      });
    }
    handleCloseDialog();
  };

  const handleToggleFeeActive = async (fee: PropertyFee) => {
    await updateFee.mutateAsync({
      id: fee.id,
      is_active: !fee.is_active,
    });
  };

  const handleDeleteFee = async (feeId: string) => {
    if (confirm('Are you sure you want to delete this fee?')) {
      await deleteFee.mutateAsync(feeId);
    }
  };

  const getFeeAppliesLabel = (appliesTo: string) => {
    switch (appliesTo) {
      case 'booking': return 'Per Booking';
      case 'per_night': return 'Per Night';
      case 'per_guest': return 'Per Guest';
      default: return appliesTo;
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="space-y-6" onClick={handleContainerClick}>
      {/* Standard Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Standard Fees
          </CardTitle>
          <CardDescription>
            Configure cleaning fee and service fee for this property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cleaning-fee">Cleaning Fee ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cleaning-fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cleaningFee}
                  onChange={(e) => setCleaningFee(parseFloat(e.target.value) || 0)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                One-time fee charged per booking
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-fee">Service Fee (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="service-fee"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={serviceFeePercentage}
                  onChange={(e) => setServiceFeePercentage(parseFloat(e.target.value) || 0)}
                  className="pl-9"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Percentage of accommodation total
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => updateStandardFees.mutate()}
            disabled={updateStandardFees.isPending}
          >
            {updateStandardFees.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Standard Fees'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Custom Fees */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Custom Fees
              </CardTitle>
              <CardDescription>
                Add additional fees like pet fees, extra guest fees, etc.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Fee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingFee ? 'Edit Fee' : 'Add New Fee'}</DialogTitle>
                  <DialogDescription>
                    Configure the fee details. This fee will be displayed to guests during booking.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fee-name">Fee Name *</Label>
                    <Input
                      id="fee-name"
                      value={newFeeName}
                      onChange={(e) => setNewFeeName(e.target.value)}
                      placeholder="e.g., Pet Fee, Extra Guest Fee"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fee-type">Fee Type</Label>
                      <Select value={newFeeType} onValueChange={(v) => setNewFeeType(v as 'flat' | 'percentage')}>
                        <SelectTrigger id="fee-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">Flat Amount ($)</SelectItem>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fee-amount">Amount</Label>
                      <div className="relative">
                        {newFeeType === 'flat' ? (
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        )}
                        <Input
                          id="fee-amount"
                          type="number"
                          min="0"
                          step={newFeeType === 'flat' ? '0.01' : '0.1'}
                          value={newFeeAmount}
                          onChange={(e) => setNewFeeAmount(parseFloat(e.target.value) || 0)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fee-applies-to">Applies To</Label>
                    <Select value={newFeeAppliesTo} onValueChange={(v) => setNewFeeAppliesTo(v as 'booking' | 'per_night' | 'per_guest')}>
                      <SelectTrigger id="fee-applies-to">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Per Booking (one-time)</SelectItem>
                        <SelectItem value="per_night">Per Night</SelectItem>
                        <SelectItem value="per_guest">Per Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {newFeeAppliesTo === 'booking' && 'Fee is charged once per booking'}
                      {newFeeAppliesTo === 'per_night' && 'Fee is multiplied by the number of nights'}
                      {newFeeAppliesTo === 'per_guest' && 'Fee is multiplied by the number of guests'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fee-description">Description (optional)</Label>
                    <Textarea
                      id="fee-description"
                      value={newFeeDescription}
                      onChange={(e) => setNewFeeDescription(e.target.value)}
                      placeholder="Explain what this fee covers..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleSaveFee}
                    disabled={createFee.isPending || updateFee.isPending}
                  >
                    {(createFee.isPending || updateFee.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      editingFee ? 'Update Fee' : 'Add Fee'
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
          ) : fees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No custom fees configured</p>
              <p className="text-sm">Click "Add Fee" to create one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fees.map((fee) => (
                <div
                  key={fee.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{fee.fee_name}</span>
                      <Badge variant={fee.is_active ? 'default' : 'secondary'}>
                        {fee.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {getFeeAppliesLabel(fee.fee_applies_to)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {fee.fee_type === 'flat' ? `$${fee.fee_amount.toFixed(2)}` : `${fee.fee_amount}%`}
                      {fee.description && <span className="ml-2">• {fee.description}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={fee.is_active}
                      onCheckedChange={() => handleToggleFeeActive(fee)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(fee)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFee(fee.id)}
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
    </div>
  );
};
