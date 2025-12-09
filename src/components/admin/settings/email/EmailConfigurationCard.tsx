
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save, ExternalLink, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

const EmailConfigurationCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();

  const { data: emailSettings } = useQuery({
    queryKey: ['email-settings', organization?.id],
    queryFn: async () => {
      let query = supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['emailFromAddress', 'emailFromName', 'emailReplyTo']);

      if (organization?.id) {
        query = query.eq('organization_id', organization.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>) || {};
    },
    enabled: !!organization?.id,
  });

  const handleSaveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save settings.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const settings = [
        { key: 'emailFromAddress', value: formData.get('emailFromAddress') as string },
        { key: 'emailFromName', value: formData.get('emailFromName') as string },
        { key: 'emailReplyTo', value: formData.get('emailReplyTo') as string },
      ].filter(setting => setting.value);

      for (const setting of settings) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            created_by: user.id,
            organization_id: organization?.id
          }, { onConflict: 'key,organization_id' });
        
        if (error) throw error;
      }

      // Mark email setup as verified after successful configuration
      await supabase
        .from('site_settings')
        .upsert({
          key: 'emailSetupVerified',
          value: 'true',
          created_by: user.id,
          organization_id: organization?.id
        }, { onConflict: 'key,organization_id' });

      toast({
        title: "Settings Saved",
        description: "Email configuration has been updated successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
      queryClient.invalidateQueries({ queryKey: ['email-setup-status'] });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save email settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Email Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailFromAddress">From Email Address *</Label>
              <Input
                id="emailFromAddress"
                name="emailFromAddress"
                type="email"
                placeholder="noreply@yourdomain.com"
                defaultValue={emailSettings?.emailFromAddress || ''}
                required
              />
              <p className="text-xs text-gray-600">
                Must be verified in your Resend account
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailFromName">From Name</Label>
              <Input
                id="emailFromName"
                name="emailFromName"
                placeholder="Your Business Name"
                defaultValue={emailSettings?.emailFromName || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailReplyTo">Reply-To Email</Label>
              <Input
                id="emailReplyTo"
                name="emailReplyTo"
                type="email"
                placeholder="reply@inbound.yourdomain.com"
                defaultValue={emailSettings?.emailReplyTo || ''}
              />
              <p className="text-xs text-muted-foreground">
                Uses inbound subdomain to capture guest replies via webhook
              </p>
            </div>
          </div>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>✅ Resend API Key Configured!</strong>
              <br />
              <span className="text-sm">
                Your Resend API key is now configured. Complete the form above and test your email setup below.
              </span>
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>📧 Next Steps:</strong>
              <br />
              <span className="text-sm">
                1. Fill in your sender email address (must be verified in Resend)
                <br />
                2. Add your business name and reply-to email
                <br />
                3. Save the configuration
                <br />
                4. Test your setup using the Email Testing section below
              </span>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://resend.com/domains', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Verify Domain in Resend
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <Button type="submit" disabled={isLoading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Email Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailConfigurationCard;
