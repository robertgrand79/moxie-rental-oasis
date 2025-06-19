
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Clock, Zap } from 'lucide-react';
import { NewsletterFormData } from './types';

interface EnhancedNewsletterFormProps {
  onSubmit: (data: NewsletterFormData) => Promise<void>;
  isLoading: boolean;
}

const EnhancedNewsletterForm = ({ onSubmit, isLoading }: EnhancedNewsletterFormProps) => {
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(false);
  
  const form = useForm<NewsletterFormData>({
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      emailOptIn: true,
      smsOptIn: false,
      communicationPreferences: {
        frequency: 'weekly',
        preferredTime: 'morning',
      },
    },
  });

  const handleSubmit = async (data: NewsletterFormData) => {
    // Ensure at least one communication method is selected
    if (!data.emailOptIn && !data.smsOptIn) {
      form.setError('root', {
        message: 'Please select at least one communication method (Email or SMS)'
      });
      return;
    }

    // If SMS is selected, phone number is required
    if (data.smsOptIn && !data.phone?.trim()) {
      form.setError('phone', {
        message: 'Phone number is required for SMS updates'
      });
      return;
    }

    await onSubmit(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Stay Connected
        </CardTitle>
        <CardDescription>
          Get travel insights and Eugene adventures via email or text
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your full name"
              {...form.register('name', { required: 'Name is required' })}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
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

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              {...form.register('phone')}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
            )}
          </div>

          {/* Communication Preferences */}
          <div className="space-y-3">
            <Label className="text-base font-medium">How would you like to hear from us?</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailOptIn"
                checked={emailOptIn}
                onCheckedChange={(checked) => {
                  setEmailOptIn(checked as boolean);
                  form.setValue('emailOptIn', checked as boolean);
                }}
              />
              <Label htmlFor="emailOptIn" className="flex items-center gap-2 cursor-pointer">
                <Mail className="h-4 w-4 text-blue-600" />
                Email newsletters
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="smsOptIn"
                checked={smsOptIn}
                onCheckedChange={(checked) => {
                  setSmsOptIn(checked as boolean);
                  form.setValue('smsOptIn', checked as boolean);
                }}
              />
              <Label htmlFor="smsOptIn" className="flex items-center gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4 text-green-600" />
                SMS updates
              </Label>
            </div>
          </div>

          {/* Frequency Preferences */}
          {(emailOptIn || smsOptIn) && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="frequency">How often?</Label>
                <Select
                  value={form.watch('communicationPreferences.frequency')}
                  onValueChange={(value) => 
                    form.setValue('communicationPreferences.frequency', value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Preferred time
                </Label>
                <Select
                  value={form.watch('communicationPreferences.preferredTime')}
                  onValueChange={(value) => 
                    form.setValue('communicationPreferences.preferredTime', value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (6-12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12-6 PM)</SelectItem>
                    <SelectItem value="evening">Evening (6-10 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {form.formState.errors.root && (
            <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Subscribing...' : 'Subscribe Now'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By subscribing, you agree to receive communications from Moxie Travel. 
            You can unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedNewsletterForm;
