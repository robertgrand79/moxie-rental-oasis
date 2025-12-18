import React, { useState, useEffect } from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle2, AlertCircle, Loader2, Copy, ExternalLink, Phone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ConfigStatus = ({ configured }: { configured: boolean }) => (
  <span className={`flex items-center gap-1 text-sm ${configured ? 'text-green-600' : 'text-muted-foreground'}`}>
    {configured ? (
      <>
        <CheckCircle2 className="h-4 w-4" />
        Configured
      </>
    ) : (
      <>
        <AlertCircle className="h-4 w-4" />
        Not configured
      </>
    )}
  </span>
);

const CommunicationsSettingsPage = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { setApiKey, loading } = useSecureApiKeys();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    openphone_api_key: '',
    openphone_phone_number: '',
    resend_api_key: '',
  });

  const [phoneNumbers, setPhoneNumbers] = useState<Array<{ id: string; formattedNumber: string; name: string }>>([]);
  const [fetchingPhones, setFetchingPhones] = useState(false);

  const [configuredKeys, setConfiguredKeys] = useState({
    openphone_api_key: false,
    resend_api_key: false,
  });

  useEffect(() => {
    if (organization) {
      const org = organization as typeof organization & {
        openphone_api_key?: string;
        openphone_phone_number?: string;
        resend_api_key?: string;
      };
      
      setConfiguredKeys({
        openphone_api_key: !!org.openphone_api_key,
        resend_api_key: !!org.resend_api_key,
      });
      
      setFormData(prev => ({
        ...prev,
        openphone_phone_number: org.openphone_phone_number || '',
      }));
    }
  }, [organization]);

  useEffect(() => {
    const autoFetchPhones = async () => {
      if (!organization?.id) return;
      if (!configuredKeys.openphone_api_key) return;
      if (phoneNumbers.length > 0) return;
      
      const org = organization as typeof organization & { openphone_phone_number?: string };
      if (!org.openphone_phone_number?.startsWith('PN')) return;
      
      setFetchingPhones(true);
      try {
        const { data, error } = await supabase.functions.invoke('fetch-quo-phone-numbers', {
          body: { organizationId: organization.id }
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        setPhoneNumbers(data.phoneNumbers || []);
      } catch (err: any) {
        console.error('Error auto-fetching phone numbers:', err);
      } finally {
        setFetchingPhones(false);
      }
    };
    
    autoFetchPhones();
  }, [organization?.id, configuredKeys.openphone_api_key]);

  const openphoneWebhookUrl = organization 
    ? `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/openphone-webhook?org=${organization.id}`
    : '';

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(openphoneWebhookUrl);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    let success = true;
    
    if (formData.openphone_api_key) {
      success = await setApiKey(organization.id, 'openphone_api_key', formData.openphone_api_key) && success;
    }
    if (formData.resend_api_key) {
      success = await setApiKey(organization.id, 'resend_api_key', formData.resend_api_key) && success;
    }
    
    if (formData.openphone_phone_number !== (organization as any).openphone_phone_number) {
      const { error } = await supabase
        .from('organizations')
        .update({ openphone_phone_number: formData.openphone_phone_number })
        .eq('id', organization.id);
      
      if (error) {
        console.error('Error updating phone number:', error);
        success = false;
      }
    }

    if (success) {
      setFormData(prev => ({
        ...prev,
        openphone_api_key: '',
        resend_api_key: '',
      }));
      refetch();
      toast({
        title: "Settings saved",
        description: "Communications settings updated successfully",
      });
    }
  };

  if (!organization) {
    return (
      <SettingsSidebarLayout title="Communications" description="Configure SMS and Email">
        <div className="text-center py-8">No organization found</div>
      </SettingsSidebarLayout>
    );
  }

  return (
    <SettingsSidebarLayout title="Communications" description="Configure SMS and Email">
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-300">
            API keys are encrypted at rest using AES-256-GCM encryption
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Communications</CardTitle>
            <CardDescription>
              Configure SMS (QUO) and Email (Resend) API keys for guest messaging.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">QUO SMS</h4>
                
                <div>
                  <Label htmlFor="openphone_api_key">QUO API Key</Label>
                  <Input
                    id="openphone_api_key"
                    type="password"
                    placeholder={configuredKeys.openphone_api_key ? '••••••••••••••••' : 'Enter your QUO API key'}
                    value={formData.openphone_api_key}
                    onChange={(e) => setFormData({ ...formData, openphone_api_key: e.target.value })}
                    disabled={!isOrgAdmin() || loading}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={configuredKeys.openphone_api_key} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="openphone_phone_number">QUO Phone Number</Label>
                  <div className="flex gap-2 mt-1">
                    {phoneNumbers.length > 0 ? (
                      <Select
                        value={formData.openphone_phone_number}
                        onValueChange={(value) => setFormData({ ...formData, openphone_phone_number: value })}
                        disabled={!isOrgAdmin() || loading}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a phone number" />
                        </SelectTrigger>
                        <SelectContent>
                          {phoneNumbers.map((pn) => (
                            <SelectItem key={pn.id} value={pn.id}>
                              {pn.formattedNumber} - {pn.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="openphone_phone_number"
                        type="text"
                        placeholder="Click 'Fetch' to load phone numbers"
                        value={formData.openphone_phone_number}
                        onChange={(e) => setFormData({ ...formData, openphone_phone_number: e.target.value })}
                        disabled={!isOrgAdmin() || loading}
                        className="flex-1"
                      />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!organization?.id && !configuredKeys.openphone_api_key && !formData.openphone_api_key) {
                          toast({
                            title: "API Key Required",
                            description: "Please enter and save your QUO API key first",
                            variant: "destructive",
                          });
                          return;
                        }
                        setFetchingPhones(true);
                        try {
                          const { data, error } = await supabase.functions.invoke('fetch-quo-phone-numbers', {
                            body: { organizationId: organization?.id }
                          });
                          if (error) throw error;
                          if (data.error) throw new Error(data.error);
                          setPhoneNumbers(data.phoneNumbers || []);
                          if (data.phoneNumbers?.length === 0) {
                            toast({
                              title: "No Phone Numbers",
                              description: "No phone numbers found in your QUO account",
                            });
                          } else {
                            toast({
                              title: "Phone Numbers Loaded",
                              description: `Found ${data.phoneNumbers.length} phone number(s)`,
                            });
                          }
                        } catch (err: any) {
                          console.error('Error fetching phone numbers:', err);
                          toast({
                            title: "Failed to Fetch",
                            description: err.message || "Could not fetch phone numbers from QUO",
                            variant: "destructive",
                          });
                        } finally {
                          setFetchingPhones(false);
                        }
                      }}
                      disabled={!isOrgAdmin() || fetchingPhones}
                    >
                      {fetchingPhones ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Phone className="h-4 w-4" />
                      )}
                      <span className="ml-2">{phoneNumbers.length > 0 ? 'Refresh' : 'Fetch'}</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Webhook URL (for inbound SMS)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={openphoneWebhookUrl}
                      readOnly
                      className="font-mono text-xs bg-muted"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyWebhookUrl}
                      title="Copy webhook URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Resend Email</h4>
                
                <div>
                  <Label htmlFor="resend_api_key">Resend API Key</Label>
                  <Input
                    id="resend_api_key"
                    type="password"
                    placeholder={configuredKeys.resend_api_key ? '••••••••••••••••' : 'Enter your Resend API key'}
                    value={formData.resend_api_key}
                    onChange={(e) => setFormData({ ...formData, resend_api_key: e.target.value })}
                    disabled={!isOrgAdmin() || loading}
                  />
                  <div className="mt-1">
                    <ConfigStatus configured={configuredKeys.resend_api_key} />
                  </div>
                </div>
              </div>

              {isOrgAdmin() && (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </SettingsSidebarLayout>
  );
};

export default CommunicationsSettingsPage;
