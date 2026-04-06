import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Globe, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Shield
} from 'lucide-react';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationOperations } from '@/hooks/useOrganizationOperations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DomainDiagnostics from '@/components/domain/DomainDiagnostics';

const VERCEL_IP = '76.76.21.21';
const VERCEL_CNAME = 'cname.vercel-dns.com';

interface DnsRecord {
  type: string;
  host: string;
  value: string;
}

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const DomainSettingsTab = () => {
  const { organization, isOrgAdmin, refetch } = useCurrentOrganization();
  const { updateOrganization, updating } = useOrganizationOperations();
  const { toast } = useToast();
  
  const [customDomain, setCustomDomain] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'error' | null>(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);

  useEffect(() => {
    if (organization?.custom_domain) {
      setCustomDomain(organization.custom_domain);
    }
  }, [organization]);

  const validateDomain = (domain: string): boolean => {
    // Remove any protocol or path
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    // Basic domain validation regex
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(cleanDomain);
  };

  const cleanDomainInput = (input: string): string => {
    return input.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().toLowerCase();
  };

  const handleSaveDomain = async () => {
    if (!organization) return;

    const cleanedDomain = cleanDomainInput(customDomain);

    if (cleanedDomain && !validateDomain(cleanedDomain)) {
      toast({
        title: 'Invalid Domain',
        description: 'Please enter a valid domain (e.g., myrentals.com)',
        variant: 'destructive',
      });
      return;
    }

    // Save domain to org record first
    await updateOrganization(organization.id, {
      custom_domain: cleanedDomain || null,
    });

    setCustomDomain(cleanedDomain);
    setVerificationStatus('pending');

    // Register the domain with Vercel so SSL and routing work
    if (cleanedDomain) {
      try {
        const { error } = await supabase.functions.invoke('provision-custom-domain', {
          body: { organization_id: organization.id, domain: cleanedDomain },
        });
        if (error) throw error;
      } catch (err: any) {
        console.error('Failed to register domain with hosting:', err);
        toast({
          title: 'Domain Saved — Action Needed',
          description: 'DNS instructions are ready, but auto-registration with hosting failed. Contact support if your domain does not resolve after DNS is configured.',
          variant: 'destructive',
        });
        refetch();
        return;
      }
    }

    refetch();

    toast({
      title: 'Domain Saved',
      description: cleanedDomain
        ? 'Add the DNS records below at your registrar, then click Verify DNS.'
        : 'Custom domain has been removed.',
    });
  };

  const handleRemoveDomain = async () => {
    if (!organization) return;
    
    await updateOrganization(organization.id, {
      custom_domain: null,
    });
    
    setCustomDomain('');
    setVerificationStatus(null);
    refetch();
    
    toast({
      title: 'Domain Removed',
      description: 'Your custom domain has been removed.',
    });
  };

  const handleVerifyDns = async () => {
    if (!customDomain || !organization) return;
    
    setVerifying(true);
    setVerificationStatus(null);
    setDiagnostics([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain-dns', {
        body: { 
          domain: customDomain,
          organization_id: organization.id 
        },
      });

      if (error) throw error;

      setVerificationStatus(data.verified ? 'verified' : 'pending');
      setVerificationMessage(data.message || '');
      setDiagnostics(data.diagnostics || []);
      
      // Refetch to get updated verification status
      refetch();
      
      toast({
        title: data.verified ? 'DNS Verified!' : 'DNS Configuration Issues',
        description: data.message,
        variant: data.verified ? 'default' : 'destructive',
      });
    } catch (error: any) {
      console.error('DNS verification error:', error);
      setVerificationStatus('error');
      setVerificationMessage(error.message || 'Failed to verify DNS');
      toast({
        title: 'Verification Failed',
        description: 'Could not verify DNS records. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const activeDomain = organization?.custom_domain || customDomain || 'yourdomain.com';
  const dnsRecords: DnsRecord[] = [
    { type: 'A', host: '@', value: VERCEL_IP },
    { type: 'CNAME', host: 'www', value: VERCEL_CNAME },
    { type: 'CNAME', host: '_acme-challenge', value: `_acme-challenge.${activeDomain}.cname.vercel-dns.com` },
    { type: 'TXT', host: '_staymoxie', value: `staymoxie_verify=${organization?.id || 'your-org-id'}` },
  ];

  const registrarInstructions = [
    {
      name: 'GoDaddy',
      steps: [
        'Log in to your GoDaddy account',
        'Go to My Products → Domains → DNS',
        'Click "Add" under Records',
        'Select the record type (A or TXT)',
        'Enter the host and value from above',
        'Save your changes',
      ],
    },
    {
      name: 'Namecheap',
      steps: [
        'Log in to Namecheap and go to Domain List',
        'Click "Manage" next to your domain',
        'Go to Advanced DNS tab',
        'Click "Add New Record"',
        'Select record type and enter values',
        'Save all changes',
      ],
    },
    {
      name: 'Cloudflare',
      steps: [
        'Log in to Cloudflare dashboard',
        'Select your domain',
        'Go to DNS → Records',
        'Click "Add Record"',
        'For A records, set Proxy status to "DNS only" (gray cloud)',
        'Enter the values and save',
      ],
    },
    {
      name: 'Google Domains',
      steps: [
        'Go to domains.google.com',
        'Select your domain',
        'Click "DNS" in the left sidebar',
        'Scroll to "Custom records"',
        'Add each record with the values above',
        'Save your changes',
      ],
    },
  ];

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          Every organization gets an automatic subdomain at <strong>{organization?.slug}.staymoxie.com</strong>. 
          You can also connect your own custom domain (e.g., myrentals.com).
        </AlertDescription>
      </Alert>

      {/* Current Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Your Domains
          </CardTitle>
          <CardDescription>View your default subdomain and configure a custom domain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Default Subdomain */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Default Subdomain</p>
              <a 
                href={`https://${organization?.slug}.staymoxie.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {organization?.slug}.staymoxie.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>

          {/* Custom Domain */}
          {organization?.custom_domain && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Custom Domain</p>
                <a 
                  href={`https://${organization.custom_domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {organization.custom_domain}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Custom Domain */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
          <CardDescription>
            Connect your own domain to your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customDomain">Domain Name</Label>
            <div className="flex gap-2">
              <Input
                id="customDomain"
                placeholder="myrentals.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                disabled={!isOrgAdmin()}
              />
              {isOrgAdmin() && (
                <Button onClick={handleSaveDomain} disabled={updating}>
                  {updating ? 'Saving...' : organization?.custom_domain ? 'Update' : 'Add Domain'}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your domain without http:// or www (e.g., myrentals.com)
            </p>
          </div>

          {organization?.custom_domain && isOrgAdmin() && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveDomain}
              disabled={updating}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Custom Domain
            </Button>
          )}
        </CardContent>
      </Card>

      {/* DNS Instructions - Show when domain is set */}
      {organization?.custom_domain && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>DNS Configuration</CardTitle>
              <CardDescription>
                Add these DNS records at your domain registrar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  DNS changes can take up to 24–48 hours to propagate worldwide.
                  {' '}<strong>Using Cloudflare?</strong> Make sure all records are set to <strong>DNS only</strong> (grey cloud ☁️, not orange 🟠) — the orange proxy will break SSL.
                </AlertDescription>
              </Alert>

              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Host</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Value</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Copy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dnsRecords.map((record, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-mono">{record.type}</td>
                        <td className="px-4 py-3 text-sm font-mono">{record.host}</td>
                        <td className="px-4 py-3 text-sm font-mono break-all">{record.value}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(record.value, `${record.type}-${record.host}`)}
                          >
                            {copiedField === `${record.type}-${record.host}` ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Registrar Instructions */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Instructions for Popular Registrars</p>
                {registrarInstructions.map((registrar) => (
                  <Collapsible key={registrar.name}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium">{registrar.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 border border-t-0 rounded-b-lg">
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        {registrar.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Verification */}
          <Card>
            <CardHeader>
              <CardTitle>Verify Configuration</CardTitle>
              <CardDescription>
                Check if your DNS records are properly configured
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button onClick={handleVerifyDns} disabled={verifying}>
                  {verifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verify DNS
                    </>
                  )}
                </Button>
                {getStatusBadge()}
              </div>

              {verificationMessage && (
                <Alert variant={verificationStatus === 'verified' ? 'default' : 'destructive'}>
                  <AlertDescription>{verificationMessage}</AlertDescription>
                </Alert>
              )}

              {/* Diagnostics Display */}
              {diagnostics.length > 0 && (
                <DomainDiagnostics 
                  diagnostics={diagnostics}
                  domain={organization.custom_domain}
                  orgId={organization.id}
                />
              )}

              {verificationStatus === 'verified' && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20">
                  <Shield className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    Your DNS is configured correctly! SSL will be automatically provisioned.
                    Your site should be live at <strong>https://{organization.custom_domain}</strong> shortly.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <span>DNS changes can take up to 24–48 hours to propagate worldwide.</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DomainSettingsTab;
