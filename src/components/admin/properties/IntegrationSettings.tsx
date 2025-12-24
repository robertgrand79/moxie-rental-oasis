import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Property } from '@/types/property';
import { ExternalLink, Webhook, Key, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const integrationSchema = z.object({
  airbnbListingUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  priceLabsPropertyId: z.string().optional(),
  webhookEnabled: z.boolean().default(false),
});

type IntegrationFormData = z.infer<typeof integrationSchema>;

interface IntegrationSettingsProps {
  property: Property;
}

const IntegrationSettings = ({ property }: IntegrationSettingsProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      airbnbListingUrl: property.airbnb_listing_url || '',
      priceLabsPropertyId: '',
      webhookEnabled: false,
    },
  });

  const onSubmit = async (data: IntegrationFormData) => {
    setIsSaving(true);
    try {
      // Update property with Airbnb listing URL
      const { error } = await supabase
        .from('properties')
        .update({
          airbnb_listing_url: data.airbnbListingUrl || null,
        })
        .eq('id', property.id);

      if (error) throw error;
      
      toast({
        title: "Settings Updated",
        description: "Integration settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to save integration settings:', error);
      toast({
        title: "Error",
        description: "Failed to update integration settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Booking Platform Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Booking Platform Integration
            </CardTitle>
            <CardDescription>
              Connect your property to external booking platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="airbnbListingUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Airbnb Listing URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://www.airbnb.com/rooms/12345678"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Link to your Airbnb listing for review sync and reference
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceLabsPropertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PriceLabs Property ID (Legacy)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your PriceLabs property ID"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Note: Configure PriceLabs mapping in the "PriceLabs Integration" section above
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Integration Settings
            </Button>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>
              Set up webhooks for real-time data synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4" />
                <span className="font-medium">Webhook Endpoint</span>
              </div>
              <code className="text-sm bg-background p-2 rounded border block">
                https://joiovubyokikqjytxtuv.supabase.co/functions/v1/booking-webhook
              </code>
            </div>

            <FormField
              control={form.control}
              name="webhookEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Webhooks
                    </FormLabel>
                    <FormDescription>
                      Receive real-time notifications for booking changes
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              <p>Configure this webhook URL in your booking platform to receive:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>New reservation notifications</li>
                <li>Booking modifications and cancellations</li>
                <li>Payment status updates</li>
                <li>Guest message notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default IntegrationSettings;
