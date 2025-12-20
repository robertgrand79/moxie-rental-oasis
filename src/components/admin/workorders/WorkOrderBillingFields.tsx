import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Clock, Calculator, CheckCircle2 } from 'lucide-react';

interface WorkOrderBillingFieldsProps {
  formData: {
    billing_type: string;
    billing_rate: number | undefined;
    hours_worked: number | undefined;
    billing_amount: number | undefined;
    payment_status: string;
    payment_notes: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  contractorRate?: number;
  isCompleted?: boolean;
}

const WorkOrderBillingFields = ({
  formData,
  setFormData,
  contractorRate,
  isCompleted = false,
}: WorkOrderBillingFieldsProps) => {
  // Calculate billing amount when hours or rate changes
  const calculateAmount = React.useCallback(() => {
    if (formData.billing_type === 'hourly' && formData.billing_rate && formData.hours_worked) {
      return formData.billing_rate * formData.hours_worked;
    }
    return formData.billing_amount;
  }, [formData.billing_type, formData.billing_rate, formData.hours_worked, formData.billing_amount]);

  // Auto-calculate when values change
  React.useEffect(() => {
    if (formData.billing_type === 'hourly' && formData.billing_rate && formData.hours_worked) {
      const calculated = formData.billing_rate * formData.hours_worked;
      if (calculated !== formData.billing_amount) {
        setFormData((prev: any) => ({ ...prev, billing_amount: calculated }));
      }
    }
  }, [formData.billing_type, formData.billing_rate, formData.hours_worked]);

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Billing & Payment</h3>
        {formData.billing_amount && formData.billing_amount > 0 && (
          <Badge className={paymentStatusColors[formData.payment_status] || 'bg-muted'}>
            {formData.payment_status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {formData.payment_status}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Billing Type */}
        <div className="space-y-2">
          <Label>Billing Type</Label>
          <Select
            value={formData.billing_type}
            onValueChange={(value) => {
              setFormData((prev: any) => ({ 
                ...prev, 
                billing_type: value,
                // Reset calculated amount when switching types
                billing_amount: value === 'fixed' ? prev.billing_amount : undefined,
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select billing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hourly Rate
                </span>
              </SelectItem>
              <SelectItem value="fixed">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Fixed Price
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Billing Rate */}
        <div className="space-y-2">
          <Label>
            {formData.billing_type === 'hourly' ? 'Hourly Rate ($)' : 'Fixed Price ($)'}
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder={contractorRate ? contractorRate.toFixed(2) : '0.00'}
              value={formData.billing_rate || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                setFormData((prev: any) => ({ ...prev, billing_rate: value }));
              }}
              className="pl-8"
            />
          </div>
          {contractorRate && !formData.billing_rate && (
            <p className="text-xs text-muted-foreground">
              Contractor default: ${contractorRate.toFixed(2)}/hr
            </p>
          )}
        </div>

        {/* Hours Worked (only for hourly billing) */}
        {formData.billing_type === 'hourly' && (
          <div className="space-y-2">
            <Label>Hours Worked</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min="0"
                step="0.25"
                placeholder="0.00"
                value={formData.hours_worked || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  setFormData((prev: any) => ({ ...prev, hours_worked: value }));
                }}
                className="pl-8"
              />
            </div>
          </div>
        )}

        {/* Total Amount */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Total Amount
            {formData.billing_type === 'hourly' && (
              <span className="text-xs text-muted-foreground">(auto-calculated)</span>
            )}
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.billing_amount || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                setFormData((prev: any) => ({ ...prev, billing_amount: value }));
              }}
              className="pl-8"
              readOnly={formData.billing_type === 'hourly'}
            />
          </div>
        </div>
      </div>

      {/* Payment Status (only show when there's a billing amount and work is completed) */}
      {isCompleted && formData.billing_amount && formData.billing_amount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, payment_status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Payment Notes</Label>
            <Textarea
              placeholder="Payment reference, check number, etc."
              value={formData.payment_notes}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, payment_notes: e.target.value }))}
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderBillingFields;
