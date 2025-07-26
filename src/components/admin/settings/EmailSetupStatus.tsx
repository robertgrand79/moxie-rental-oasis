
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Mail, ExternalLink, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const EmailSetupStatus = () => {
  const { data: emailSettings, isLoading } = useQuery({
    queryKey: ['email-setup-status'],
    queryFn: async () => {
      // Check if we have email settings configured
      const { data: settings, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['emailFromAddress', 'emailFromName', 'emailReplyTo']);

      if (error) throw error;

      const settingsMap = settings?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>) || {};

      // Test if Resend function is accessible
      try {
        const { error: functionError } = await supabase.functions.invoke('send-newsletter-preview', {
          body: { test: true }
        });
        
        return {
          emailSettings: settingsMap,
          resendConfigured: !functionError?.message?.includes('RESEND_API_KEY'),
          functionAccessible: true
        };
      } catch (error) {
        return {
          emailSettings: settingsMap,
          resendConfigured: false,
          functionAccessible: false
        };
      }
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Checking email configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasEmailSettings = emailSettings?.emailSettings?.emailFromAddress;
  const resendConfigured = emailSettings?.resendConfigured;
  const functionAccessible = emailSettings?.functionAccessible;

  const getStatusBadge = (isConfigured: boolean) => (
    <Badge variant={isConfigured ? "default" : "destructive"} className="ml-2">
      {isConfigured ? "Configured" : "Not Configured"}
    </Badge>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Email Service Setup Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              {hasEmailSettings ? (
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              )}
              <span className="text-sm font-medium">Email Settings</span>
            </div>
            {getStatusBadge(hasEmailSettings)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              {resendConfigured ? (
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              )}
              <span className="text-sm font-medium">Resend API</span>
            </div>
            {getStatusBadge(resendConfigured)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              {functionAccessible ? (
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              )}
              <span className="text-sm font-medium">Email Function</span>
            </div>
            {getStatusBadge(functionAccessible)}
          </div>
        </div>

        {(!hasEmailSettings || !resendConfigured) && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Email service setup required:</strong>
              <div className="mt-2 space-y-2">
                {!resendConfigured && (
                  <div>
                    <p className="text-sm">1. Resend API Key is missing</p>
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://resend.com/', '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Get Resend Account
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://resend.com/api-keys', '_blank')}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Create API Key
                      </Button>
                    </div>
                  </div>
                )}
                {!hasEmailSettings && (
                  <p className="text-sm">2. Configure your sender email address in Site Settings</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {hasEmailSettings && resendConfigured && functionAccessible && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>✅ Email service is fully configured!</strong>
              <br />
              Newsletter previews and campaigns are ready to send.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailSetupStatus;
