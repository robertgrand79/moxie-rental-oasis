
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Edit, Mail, MessageSquare, User, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EnhancedSubscriber } from '@/components/newsletter/types';

interface EnhancedSubscriberFormData {
  email: string;
  name: string;
  phone: string;
  is_active: boolean;
  email_opt_in: boolean;
  sms_opt_in: boolean;
  communication_preferences: {
    frequency: string;
    preferred_time: string;
  };
}

interface EnhancedSubscriberModalProps {
  subscriber: EnhancedSubscriber | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: any) => Promise<void>;
  isLoading: boolean;
}

const EnhancedSubscriberModal = ({ 
  subscriber, 
  open, 
  onClose, 
  onSubmit, 
  isLoading 
}: EnhancedSubscriberModalProps) => {
  const form = useForm<EnhancedSubscriberFormData>({
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      is_active: true,
      email_opt_in: true,
      sms_opt_in: false,
      communication_preferences: {
        frequency: 'weekly',
        preferred_time: 'morning',
      },
    },
  });

  useEffect(() => {
    if (subscriber) {
      form.reset({
        email: subscriber.email,
        name: subscriber.name || '',
        phone: subscriber.phone || '',
        is_active: subscriber.is_active,
        email_opt_in: subscriber.email_opt_in,
        sms_opt_in: subscriber.sms_opt_in,
        communication_preferences: {
          frequency: subscriber.communication_preferences?.frequency || 'weekly',
          preferred_time: subscriber.communication_preferences?.preferred_time || 'morning',
        },
      });
    }
  }, [subscriber, form]);

  const handleSubmit = async (data: EnhancedSubscriberFormData) => {
    if (subscriber) {
      await onSubmit(subscriber.id, {
        email: data.email,
        name: data.name || null,
        phone: data.phone || null,
        is_active: data.is_active,
        email_opt_in: data.email_opt_in,
        sms_opt_in: data.sms_opt_in,
        communication_preferences: data.communication_preferences,
      });
      onClose();
    }
  };

  if (!subscriber) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Subscriber
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" />
              Contact Information
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  {...form.register('name')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                {...form.register('phone')}
              />
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MessageSquare className="h-4 w-4" />
              Communication Preferences
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email_opt_in"
                  checked={form.watch('email_opt_in')}
                  onCheckedChange={(checked) => form.setValue('email_opt_in', checked as boolean)}
                />
                <Label htmlFor="email_opt_in" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email newsletters
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms_opt_in"
                  checked={form.watch('sms_opt_in')}
                  onCheckedChange={(checked) => form.setValue('sms_opt_in', checked as boolean)}
                />
                <Label htmlFor="sms_opt_in" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  SMS updates
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={form.watch('communication_preferences.frequency')}
                  onValueChange={(value) => 
                    form.setValue('communication_preferences.frequency', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_time">Preferred Time</Label>
                <Select
                  value={form.watch('communication_preferences.preferred_time')}
                  onValueChange={(value) => 
                    form.setValue('communication_preferences.preferred_time', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked as boolean)}
              />
              <Label htmlFor="is_active">Active subscription</Label>
            </div>
          </div>

          {/* Subscriber Info */}
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium">Subscriber Details</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Contact Source: <Badge variant="outline">{subscriber.contact_source}</Badge></div>
              <div>Subscribed: {new Date(subscriber.subscribed_at).toLocaleDateString()}</div>
              {subscriber.last_engagement_date && (
                <div>Last Active: {new Date(subscriber.last_engagement_date).toLocaleDateString()}</div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSubscriberModal;
