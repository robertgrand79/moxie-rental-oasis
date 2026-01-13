import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Copy, ExternalLink, AlertTriangle, CheckCircle2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { PLATFORM_CONFIG, getSubdomainUrl } from '@/config/platform';

interface SubdomainSetupHelperProps {
  slug: string;
  subdomainStatus: string | null;
  customDomain?: string | null;
  compact?: boolean;
}

const SubdomainSetupHelper: React.FC<SubdomainSetupHelperProps> = ({
  slug,
  subdomainStatus,
  customDomain,
  compact = false,
}) => {
  const subdomainUrl = getSubdomainUrl(slug);
  const isUsingCustomDomain = !!customDomain;
  const isSubdomainActive = subdomainStatus === 'active';

  const handleCopySubdomain = () => {
    navigator.clipboard.writeText(subdomainUrl);
    toast.success('Subdomain copied to clipboard');
  };

  const handleOpenLovableDomains = () => {
    window.open(PLATFORM_CONFIG.LOVABLE_DOMAINS_URL, '_blank');
  };

  // If using custom domain, show simplified status
  if (isUsingCustomDomain) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Custom domain:</span>
        <span className="font-mono">{customDomain}</span>
      </div>
    );
  }

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {isSubdomainActive ? (
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-950/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Lovable Registered
              </Badge>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 cursor-help">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Registration Required
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">
                    Subdomain must be registered in Lovable project settings. 
                    DNS is configured via wildcard, but Lovable requires explicit registration.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopySubdomain} className="h-7 px-2">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          {!isSubdomainActive && (
            <Button variant="ghost" size="sm" onClick={handleOpenLovableDomains} className="h-7 px-2">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium">Domain Registration</h5>
        {isSubdomainActive ? (
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-950/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Registered
          </Badge>
        ) : (
          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Action Required
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 px-2 py-1 bg-background rounded text-sm font-mono truncate">
          {subdomainUrl}
        </code>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleCopySubdomain}>
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy subdomain</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleOpenLovableDomains}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Lovable Domains</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!isSubdomainActive && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-amber-600 dark:text-amber-400">
            ⚠️ Subdomain requires Lovable registration
          </p>
          <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
            <li>Copy the subdomain above</li>
            <li>Click the link icon to open Lovable Domains</li>
            <li>Add the subdomain and wait for verification</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default SubdomainSetupHelper;
