
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Plane, Shield, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { NewsletterFormData } from './types';

interface EnhancedNewsletterFormProps {
  onSubmit: (data: NewsletterFormData) => Promise<void>;
  isLoading: boolean;
  showSMSOption?: boolean;
  title?: string;
  description?: string;
}

const EnhancedNewsletterForm: React.FC<EnhancedNewsletterFormProps> = ({ 
  onSubmit, 
  isLoading, 
  showSMSOption = true,
  title = "Stay Connected with Moxie Travel",
  description = "Get travel tips, Eugene local secrets, and stories from Robert & Shelly's adventures."
}) => {
  const form = useForm<NewsletterFormData>({
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      emailOptIn: true,
      smsOptIn: false,
      communicationPreferences: {
        frequency: 'weekly',
        preferred_time: 'morning',
      },
    },
  });

  const handleSubmit = async (data: NewsletterFormData) => {
    // Validate at least one communication method
    if (!data.emailOptIn && !data.smsOptIn) {
      form.setError('root', { 
        message: 'Please select at least one communication method (email or SMS)' 
      });
      return;
    }

    // Validate phone if SMS is selected
    if (data.smsOptIn && (!data.phone || data.phone.trim() === '')) {
      form.setError('phone', { 
        message: 'Phone number is required for SMS updates' 
      });
      return;
    }

    await onSubmit(data);
    form.reset();
  };

  const watchEmailOptIn = form.watch('emailOptIn');
  const watchSmsOptIn = form.watch('smsOptIn');

  return (
    <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 mb-2 group-hover:text-primary transition-colors">
          <Plane className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Name Input */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Your name (optional)"
                      {...field}
                      className="text-sm bg-background border-border focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Input */}
            <FormField
              control={form.control}
              name="email"
              rules={{ 
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                      className="text-sm bg-background border-border focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Input - Show if SMS option is enabled */}
            {showSMSOption && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Phone number (for SMS updates)"
                        {...field}
                        className="text-sm bg-background border-border focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Communication Preferences */}
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground">How would you like to hear from us?</h4>
              
              {/* Email Opt-in */}
              <FormField
                control={form.control}
                name="emailOptIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <FormLabel className="text-sm">Email updates</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* SMS Opt-in - Show if SMS option is enabled */}
              {showSMSOption && (
                <FormField
                  control={form.control}
                  name="smsOptIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <FormLabel className="text-sm">SMS updates</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Communication Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="communicationPreferences.frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="How often?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communicationPreferences.preferred_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Preferred Time</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="When?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200 text-sm py-3 h-auto font-medium"
              disabled={isLoading || (!watchEmailOptIn && !watchSmsOptIn)}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Subscribing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {watchEmailOptIn && watchSmsOptIn && <><Mail className="h-4 w-4" /><MessageSquare className="h-4 w-4" /></>}
                  {watchEmailOptIn && !watchSmsOptIn && <Mail className="h-4 w-4" />}
                  {!watchEmailOptIn && watchSmsOptIn && <MessageSquare className="h-4 w-4" />}
                  Join Our Travel Community
                </div>
              )}
            </Button>

            {/* Error message */}
            {form.formState.errors.root && (
              <p className="text-sm text-destructive text-center">
                {form.formState.errors.root.message}
              </p>
            )}

            {/* Trust Signals */}
            <div className="flex flex-col space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <Shield className="h-3 w-3 mr-1 text-green-500" />
                <span>Privacy protected • Unsubscribe anytime</span>
              </div>
              {showSMSOption && (
                <p className="text-xs text-muted-foreground text-center">
                  Message and data rates may apply. Reply STOP to opt out.
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EnhancedNewsletterForm;
