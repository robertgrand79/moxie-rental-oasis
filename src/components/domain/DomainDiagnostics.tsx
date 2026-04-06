import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

interface DomainDiagnosticsProps {
  diagnostics: DiagnosticResult[];
  domain: string;
  orgId: string;
}

const VERCEL_IP = '76.76.21.21';
const VERCEL_CNAME = 'cname.vercel-dns.com';

const troubleshootingTips: Record<string, { title: string; tips: string[] }> = {
  'Root Domain A Record': {
    title: 'How to fix root domain A record',
    tips: [
      `Add an A record with host "@" or blank pointing to ${VERCEL_IP}`,
      'Remove any conflicting A records pointing to different IP addresses',
      'If using Cloudflare, set proxy status to "DNS only" (gray cloud — NOT orange)',
      'DNS changes can take 24-48 hours to propagate worldwide',
    ],
  },
  'WWW Subdomain': {
    title: 'How to fix www subdomain',
    tips: [
      `Add a CNAME record with host "www" pointing to ${VERCEL_CNAME}`,
      `Or add an A record with host "www" pointing to ${VERCEL_IP}`,
      'This ensures visitors using www.yourdomain.com can access your site',
    ],
  },
  'TXT Verification Record': {
    title: 'How to add TXT verification',
    tips: [
      'Add a TXT record with host "_staymoxie"',
      'Set the value to the verification string shown above',
      'This proves domain ownership and speeds up SSL provisioning',
    ],
  },
};

const StatusIcon: React.FC<{ status: 'pass' | 'fail' | 'warning' }> = ({ status }) => {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'fail':
      return <XCircle className="h-5 w-5 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }
};

const DomainDiagnostics: React.FC<DomainDiagnosticsProps> = ({
  diagnostics,
  domain,
  orgId,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  
  const copyToClipboard = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  const passedCount = diagnostics.filter(d => d.status === 'pass').length;
  const failedCount = diagnostics.filter(d => d.status === 'fail').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;
  
  const allPassed = failedCount === 0;
  
  // Required DNS records for display
  const requiredRecords = [
    { type: 'A', host: '@', value: VERCEL_IP, description: 'Root domain' },
    { type: 'CNAME', host: 'www', value: VERCEL_CNAME, description: 'WWW subdomain' },
    { type: 'CNAME', host: '_acme-challenge', value: `_acme-challenge.${domain}.cname.vercel-dns.com`, description: 'SSL certificate (required)' },
    { type: 'TXT', host: '_staymoxie', value: `staymoxie_verify=${orgId}`, description: 'Domain ownership verification' },
  ];
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-lg border",
        allPassed ? "bg-green-50 border-green-200 dark:bg-green-950/20" : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20"
      )}>
        {allPassed ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
        )}
        <div>
          <p className="font-medium">
            {allPassed 
              ? 'DNS Configuration Complete' 
              : `${failedCount} issue${failedCount !== 1 ? 's' : ''} found`}
          </p>
          <p className="text-sm text-muted-foreground">
            {passedCount} passed, {warningCount} warning{warningCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      {/* Diagnostic Results */}
      <Accordion type="single" collapsible className="w-full">
        {diagnostics.map((diagnostic, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <StatusIcon status={diagnostic.status} />
                <div className="text-left">
                  <p className="font-medium">{diagnostic.check}</p>
                  <p className="text-sm text-muted-foreground">{diagnostic.message}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-8 space-y-3">
                {diagnostic.details && (
                  <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertDescription>{diagnostic.details}</AlertDescription>
                  </Alert>
                )}
                
                {diagnostic.status !== 'pass' && troubleshootingTips[diagnostic.check] && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {troubleshootingTips[diagnostic.check].title}
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {troubleshootingTips[diagnostic.check].tips.map((tip, tipIdx) => (
                        <li key={tipIdx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* Required DNS Records Reference */}
      {failedCount > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Required DNS Records</p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Host</th>
                  <th className="px-3 py-2 text-left font-medium">Value</th>
                  <th className="px-3 py-2 text-right font-medium">Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requiredRecords.map((record, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 font-mono">{record.type}</td>
                    <td className="px-3 py-2 font-mono">{record.host}</td>
                    <td className="px-3 py-2 font-mono text-xs break-all">{record.value}</td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(record.value, `record-${idx}`)}
                      >
                        {copiedField === `record-${idx}` ? (
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
        </div>
      )}
    </div>
  );
};

export default DomainDiagnostics;
