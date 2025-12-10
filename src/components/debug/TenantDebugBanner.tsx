import React, { useState, useEffect } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { useTenant } from '@/contexts/TenantContext';
import { X } from 'lucide-react';

/**
 * Temporary debug banner to diagnose tenant detection issues in production.
 * Shows key detection values. Remove after fixing issues.
 */
const TenantDebugBanner: React.FC = () => {
  const { isPlatformSite, isTenantSite } = usePlatform();
  const { tenant, loading: tenantLoading, detectedIdentifier } = useTenant();
  const [dismissed, setDismissed] = useState(false);
  const [rawValues, setRawValues] = useState({
    hostname: '',
    search: '',
    orgParam: '',
  });

  useEffect(() => {
    // Capture raw values on mount for debugging
    setRawValues({
      hostname: window.location.hostname,
      search: window.location.search,
      orgParam: new URLSearchParams(window.location.search).get('org') || 'null',
    });
  }, []);

  // Only show when ?debug=true is explicitly set
  const showDebug = window.location.search.includes('debug=true');

  if (!showDebug || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-400 text-black text-xs p-2 font-mono">
      <button 
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-yellow-500 rounded"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex flex-wrap gap-4 pr-8">
        <span><strong>hostname:</strong> {rawValues.hostname}</span>
        <span><strong>search:</strong> {rawValues.search || '(empty)'}</span>
        <span><strong>?org=</strong> {rawValues.orgParam}</span>
        <span><strong>isPlatformSite:</strong> {String(isPlatformSite)}</span>
        <span><strong>isTenantSite:</strong> {String(isTenantSite)}</span>
        <span><strong>tenantLoading:</strong> {String(tenantLoading)}</span>
        <span><strong>detectedId:</strong> {detectedIdentifier || 'null'}</span>
        <span><strong>tenant:</strong> {tenant?.slug || 'null'}</span>
      </div>
    </div>
  );
};

export default TenantDebugBanner;
