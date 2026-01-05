import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MessagingRule {
  id: string;
  property_id: string | null;
  template_id: string;
  name: string;
  trigger_type: string;
  trigger_offset_hours: number;
  trigger_time: string;
  delivery_channel: string;
  is_active: boolean;
  priority: number;
}

interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: MessagingRule | null;
}

interface FormData {
  name: string;
  property_id: string;
  template_id: string;
  trigger_type: string;
  trigger_offset_value: number;
  trigger_offset_unit: string;
  trigger_time: string;
  delivery_channel: string;
  is_active: boolean;
  priority: number;
}

const TRIGGER_TYPES = [
  { value: 'booking_confirmed', label: 'On booking confirmation' },
  { value: 'before_checkin', label: 'Before check-in' },
  { value: 'day_of_checkin', label: 'Day of check-in' },
  { value: 'after_checkin', label: 'After check-in' },
  { value: 'before_checkout', label: 'Before check-out' },
  { value: 'after_checkout', label: 'After check-out' },
];

const RuleDialog: React.FC<RuleDialogProps> = ({ open, onOpenChange, rule }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organization } = useCurrentOrganization();
  const isEditing = !!rule;
  
  // Use organization-scoped properties
  const { properties } = usePropertyFetch();
  const orgPropertyIds = properties.map(p => p.id);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      property_id: 'global',
      template_id: '',
      trigger_type: 'before_checkin',
      trigger_offset_value: 2,
      trigger_offset_unit: 'days',
      trigger_time: '09:00',
      delivery_channel: 'email',
      is_active: true,
      priority: 0,
    },
  });

  const triggerType = watch('trigger_type');
  const propertyId = watch('property_id');

  const { data: templates } = useQuery({
    queryKey: ['message-templates-for-rule', organization?.id, propertyId],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('message_templates')
        .select('id, name, property_id')
        .eq('is_active', true)
        .eq('organization_id', organization.id)
        .order('name');

      if (error) throw error;
      
      // Filter to show global templates and templates for the selected property
      return data.filter(t => 
        !t.property_id || 
        propertyId === 'global' || 
        t.property_id === propertyId
      );
    },
    enabled: !!organization?.id,
  });

  useEffect(() => {
    if (rule) {
      const offsetHours = Math.abs(rule.trigger_offset_hours);
      const unit = offsetHours >= 24 ? 'days' : 'hours';
      const value = unit === 'days' ? Math.floor(offsetHours / 24) : offsetHours;

      reset({
        name: rule.name,
        property_id: rule.property_id || 'global',
        template_id: rule.template_id,
        trigger_type: rule.trigger_type,
        trigger_offset_value: value || 2,
        trigger_offset_unit: unit,
        trigger_time: rule.trigger_time?.slice(0, 5) || '09:00',
        delivery_channel: rule.delivery_channel,
        is_active: rule.is_active,
        priority: rule.priority,
      });
    } else {
      reset({
        name: '',
        property_id: 'global',
        template_id: '',
        trigger_type: 'before_checkin',
        trigger_offset_value: 2,
        trigger_offset_unit: 'days',
        trigger_time: '09:00',
        delivery_channel: 'email',
        is_active: true,
        priority: 0,
      });
    }
  }, [rule, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Calculate offset hours
      let offsetHours = data.trigger_offset_value;
      if (data.trigger_offset_unit === 'days') {
        offsetHours *= 24;
      }
      // Make negative for "before" triggers
      if (data.trigger_type.startsWith('before_')) {
        offsetHours = -offsetHours;
      }

      const payload = {
        name: data.name,
        property_id: data.property_id === 'global' ? null : data.property_id,
        template_id: data.template_id,
        trigger_type: data.trigger_type,
        trigger_offset_hours: offsetHours,
        trigger_time: data.trigger_time + ':00',
        delivery_channel: data.delivery_channel,
        is_active: data.is_active,
        priority: data.priority,
        organization_id: organization?.id,
      };

      if (isEditing && rule) {
        const { error } = await supabase
          .from('messaging_rules')
          .update(payload)
          .eq('id', rule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('messaging_rules').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-rules'] });
      toast({ title: isEditing ? 'Rule updated' : 'Rule created' });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error saving rule', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (data: FormData) => {
    if (!data.template_id) {
      toast({ title: 'Please select a template', variant: 'destructive' });
      return;
    }
    saveMutation.mutate(data);
  };

  const showOffsetFields = !['booking_confirmed', 'day_of_checkin'].includes(triggerType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Rule' : 'Create Messaging Rule'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Check-in Instructions"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Apply To</Label>
            <RadioGroup
              value={watch('property_id')}
              onValueChange={(value) => setValue('property_id', value)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="global" id="global" />
                <Label htmlFor="global" className="font-normal">All Properties (Global)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="specific" disabled />
                <Label htmlFor="specific" className="font-normal text-muted-foreground">
                  Specific Property
                </Label>
              </div>
            </RadioGroup>
            {watch('property_id') !== 'global' && (
              <Select
                value={watch('property_id')}
                onValueChange={(value) => setValue('property_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Trigger</Label>
            <Select
              value={watch('trigger_type')}
              onValueChange={(value) => setValue('trigger_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((trigger) => (
                  <SelectItem key={trigger.value} value={trigger.value}>
                    {trigger.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showOffsetFields && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trigger_offset_value">
                  {triggerType.startsWith('before_') ? 'Time Before' : 'Time After'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="trigger_offset_value"
                    type="number"
                    min={1}
                    {...register('trigger_offset_value', { valueAsNumber: true, min: 1 })}
                    className="w-20"
                  />
                  <Select
                    value={watch('trigger_offset_unit')}
                    onValueChange={(value) => setValue('trigger_offset_unit', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger_time">Send Time</Label>
                <Input
                  id="trigger_time"
                  type="time"
                  {...register('trigger_time')}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Delivery Channel</Label>
            <RadioGroup
              value={watch('delivery_channel')}
              onValueChange={(value) => setValue('delivery_channel', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="font-normal">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="font-normal">SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="font-normal">Both</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_id">Message Template</Label>
            <Select
              value={watch('template_id')}
              onValueChange={(value) => setValue('template_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} {!template.property_id && '(Global)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!templates?.length && (
              <p className="text-sm text-muted-foreground">
                No templates available. Create a template first.
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RuleDialog;
