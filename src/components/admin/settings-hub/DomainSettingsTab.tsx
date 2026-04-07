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
  Shield,
  Info,
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
  description: string;
}

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

// Step indicator component
const StepIndicator = ({ step, current }: { step: number; current: number }) => {
  const done = current > step;
  const active = current === step;
  return (
    <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold border-2 shrink-0 ${
      done    ? 'bg-green-500 border-green-500 text-white' :
      active  ? 'bg-primary border-primary text-primary-foreground' :
                'bg-muted border-muted-foreground/30 text-muted-foreground'
    }`}>
      {done ? <Check className="h-4 w-4" /> : step}
    </div>
  );
};

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (organization?.custom_domain) {
      setCustomDomain(organization.custom_domain);
      setVerificationStatus('pending');
    }
  }, [organization]);

  // Derive which step the user is on
  const currentStep = !organization?.custom_domain ? 1 : verificationStatus === 'verified' ? 3 : 2;

  const validateDomain = (domain: string): boolean => {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(cleanDomain);
  };

  const cleanDomainInput = (input: string): string => {
    return input.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '').trim().toLowerCase();
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

    setSaving(true);

    await updateOrganization(organization.id, {
      custom_domain: cleanedDomain || null,
    });

    setCustomDomain(cleanedDomain);
    setVerificationStatus('pending');

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
          description: 'DNS instructions are ready, but auto-registration failed. Contact support if your domain does not resolve.',
          variant: 'destructive',
        });
        refetch();
        setSaving(false);
        return;
      }
    }

    refetch();
    setSaving(false);

    toast({
      title: cleanedDomain ? '✅ Domain registered!' : 'Domain removed',
      description: cleanedDomain
        ? 'Now add the DNS records below at your registrar.'
        : 'Your custom domain has been removed.',
    });
  };

  const handleRemoveDomain = async () => {
    if (!organization) return;
    await updateOrganization(organization.id, { custom_domain: null });
    setCustomDomain('');
    setVerificationStatus(null);
    setDiagnostics([]);
    setVerificationMessage('');
    refetch();
    toast({ title: 'Domain Removed', description: 'Your custom domain has been removed.' });
  };

  const handleVerifyDns = async () => {
    if (!customDomain || !organization) return;
    setVerifying(true);
    setVerificationStatus(null);
    setDiagnostics([]);

    try {
      const { data, error } = await supabase.functions.invoke('verify-domain-dns', {
        body: { domain: customDomain, organization_id: organization.id },
      });
      if (error) throw error;

      setVerificationStatus(data.verified ? 'verified' : 'pending');
      setVerificationMessage(data.message || '');
      setDiagnostics(data.diagnostics || []);
      refetch();

      toast({
        title: data.verified ? '🎉 DNS Verified!' : 'DNS not ready yet',
        description: data.message,
        variant: data.verified ? 'default' : 'destructive',
      });
    } catch (error: any) {
      setVerificationStatus('error');
      setVerificationMessage(error.message || 'Failed to verify DNS');
      toast({ title: 'Verification Failed', description: 'Could not check DNS. Please try again.', variant: 'destructive' });
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
    {
      type: 'A',
      host: '@',
      value: VERCEL_IP,
      description: 'Points your root domain to StayMoxie',
    },
    {
      type: 'CNAME',
      host: 'www',
      value: VERCEL_CNAME,
      description: 'Redirects www visitors to your site',
    },
    {
      type: 'CNAME',
      host: '_acme-challenge',
      value: `_acme-challenge.${activeDomain}.cname.vercel-dns.com`,
      description: 'Required for free SSL (https) — add this first',
    },
    {
      type: 'TXT',
      host: '_staymoxie',
      value: `staymoxie_verify=${organization?.id || 'your-org-id'}`,
      description: 'Proves you own this domain',
    },
  ];

  const registrarInstructions = [
    {
      name: 'GoDaddy',
      steps: [
        'Log in → My Products → Domains → click DNS next to your domain',
        'Click "Add" and select the record type (A, CNAME, or TXT)',
        'Enter the Host and Value from the table above — add all 4 records',
        'Save changes',
      ],
    },
    {
      name: 'Namecheap',
      steps: [
        'Log in → Domain List → click Manage next to your domain',
        'Go to the Advanced DNS tab',
        'Click "Add New Record" — add all 4 records from the table above',
        'Save all changes',
      ],
    },
    {
      name: 'Cloudflare',
      steps: [
        'Log in → select your domain → DNS → Records',
        'Click "Add Record" for each of the 4 records above',
        '⚠️ Critical: set Proxy status to "DNS only" (grey cloud ☁️) for EVERY record — the orange proxy will break SSL',
        'Save each record',
      ],
    },
    {
      name: 'Google Domains / Squarespace',
      steps: [
        'Go to domains.google.com → select your domain → DNS',
        'Scroll to "Custom records" and click "Manage custom records"',
        'Add each of the 4 records from the table above',
        'Save your changes',
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Free subdomain always-on banner */}
      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          Your site is already live at{' '}
          <a
            href={`https://${organization?.slug}.staymoxie.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline underline-offset-2"
          >
            {organization?.slug}.staymoxie.com
          </a>
          . Connect a custom domain below to use your own address instead.
        </AlertDescription>
      </Alert>

      {/* ── STEP 1: Enter domain ── */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1">
          <StepIndicator step={1} current={currentStep} />
          <div className="w-px flex-1 bg-border" />
        </div>
        <div className="flex-1 pb-6">
          <p className="font-semibold mb-1 mt-1">Enter your domain</p>
          <p className="text-sm text-muted-foreground mb-3">
            Type the domain you own (e.g. <code>myrentals.com</code>). Don't include http:// or www.
          </p>
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="myrentals.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  disabled={!isOrgAdmin() || saving}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveDomain()}
                />
                {isOrgAdmin() && (
                  <Button onClick={handleSaveDomain} disabled={saving || !customDomain.trim()}>
                    {saving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving...</> : organization?.custom_domain ? 'Update' : 'Add Domain'}
                  </Button>
                )}
              </div>
              {organization?.custom_domain && isOrgAdmin() && (
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleRemoveDomain}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Remove custom domain
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── STEP 2: Add DNS records ── */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1">
          <StepIndicator step={2} current={currentStep} />
          <div className="w-px flex-1 bg-border" />
        </div>
        <div className={`flex-1 pb-6 ${currentStep < 2 ? 'opacity-40 pointer-events-none' : ''}`}>
          <p className="font-semibold mb-1 mt-1">Add DNS records at your registrar</p>
          <p className="text-sm text-muted-foreground mb-3">
            Log in to wherever you bought your domain and add these 4 records. Each has a copy button.
          </p>

          {organization?.custom_domain && (
            <div className="space-y-4">
              {/* Cloudflare warning */}
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Using Cloudflare?</strong> Set every record to <strong>DNS only</strong> (grey cloud ☁️, not orange 🟠).
                  The orange proxy will break SSL and your site won't load.
                </AlertDescription>
              </Alert>

              {/* DNS records table */}
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-medium">Type</th>
                      <th className="px-3 py-2.5 text-left font-medium">Host</th>
                      <th className="px-3 py-2.5 text-left font-medium">Value</th>
                      <th className="px-3 py-2.5 text-right font-medium">Copy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dnsRecords.map((record, idx) => (
                      <tr key={idx} className="hover:bg-muted/40">
                        <td className="px-3 py-3 font-mono font-semibold">{record.type}</td>
                        <td className="px-3 py-3 font-mono">{record.host}</td>
                        <td className="px-3 py-3">
                          <div className="font-mono text-xs break-all">{record.value}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Info className="h-3 w-3 shrink-0" />
                            {record.description}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right">
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

              {/* Propagation note */}
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                DNS changes usually take 5–30 minutes but can take up to 48 hours to propagate worldwide.
              </p>

              {/* Per-registrar instructions */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Step-by-step for your registrar</p>
                {registrarInstructions.map((registrar) => (
                  <Collapsible key={registrar.name}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors text-sm">
                      <span className="font-medium">{registrar.name}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 pb-3 pt-2 border border-t-0 rounded-b-lg">
                      <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                        {registrar.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── STEP 3: Verify ── */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1">
          <StepIndicator step={3} current={currentStep} />
        </div>
        <div className={`flex-1 mt-1 ${currentStep < 2 ? 'opacity-40 pointer-events-none' : ''}`}>
          <p className="font-semibold mb-1">Verify your DNS</p>
          <p className="text-sm text-muted-foreground mb-3">
            Once you've added all 4 records, click below. We'll check them and activate your domain.
          </p>

          {organization?.custom_domain && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Button onClick={handleVerifyDns} disabled={verifying}>
                    {verifying ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Checking DNS...</>
                    ) : (
                      <><RefreshCw className="h-4 w-4 mr-2" />Verify DNS</>
                    )}
                  </Button>
                  {verificationStatus === 'verified' && (
                    <Badge className="bg-green-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>
                  )}
                  {verificationStatus === 'pending' && diagnostics.length > 0 && (
                    <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Not ready yet</Badge>
                  )}
                  {verificationStatus === 'error' && (
                    <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>
                  )}
                </div>

                {verificationStatus === 'verified' && (
                  <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20">
                    <Shield className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      <strong>You're all set!</strong> SSL is being provisioned automatically.
                      Your site will be live at{' '}
                      <a
                        href={`https://${organization.custom_domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline underline-offset-2"
                      >
                        https://{organization.custom_domain}
                      </a>{' '}
                      within a few minutes.
                    </AlertDescription>
                  </Alert>
                )}

                {verificationMessage && verificationStatus !== 'verified' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{verificationMessage}</AlertDescription>
                  </Alert>
                )}

                {diagnostics.length > 0 && (
                  <DomainDiagnostics
                    diagnostics={diagnostics}
                    domain={organization.custom_domain}
                    orgId={organization.id}
                  />
                )}

                {verificationStatus === 'pending' && diagnostics.length === 0 && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Add the DNS records above, wait a few minutes, then click Verify DNS.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomainSettingsTab;
