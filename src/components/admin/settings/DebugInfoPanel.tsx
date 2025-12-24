
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bug, CheckCircle, AlertCircle } from 'lucide-react';
import { debug } from '@/utils/debug';

interface DebugInfoPanelProps {
  siteData: any;
  isUserEditing?: boolean;
}

interface SettingsDebugInfo {
  rowCount: number;
  lastUpdated: string | null;
  sampleKeys: string[];
  duplicateKeys: string[];
}

const DebugInfoPanel = ({ siteData, isUserEditing }: DebugInfoPanelProps) => {
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();
  const { settings, loading, refetch } = useSimplifiedSiteSettings();
  const [dbDebug, setDbDebug] = useState<SettingsDebugInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch additional debug info directly from database
  const fetchDebugInfo = async () => {
    if (!organization?.id) return;
    
    debug.settings('[DebugPanel] Fetching debug info for org:', organization.id);
    
    try {
      // Get all settings for this org
      const { data, error } = await supabase
        .from('site_settings')
        .select('id, key, updated_at')
        .eq('organization_id', organization.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        debug.error('[DebugPanel] Error fetching settings:', error);
        return;
      }

      debug.settings('[DebugPanel] Found', data?.length || 0, 'settings rows');

      // Check for duplicate keys
      const keyCounts: Record<string, number> = {};
      data?.forEach(row => {
        keyCounts[row.key] = (keyCounts[row.key] || 0) + 1;
      });
      const duplicates = Object.entries(keyCounts)
        .filter(([_, count]) => count > 1)
        .map(([key]) => key);

      if (duplicates.length > 0) {
        debug.warn('[DebugPanel] DUPLICATE KEYS FOUND:', duplicates);
      }

      setDbDebug({
        rowCount: data?.length || 0,
        lastUpdated: data?.[0]?.updated_at || null,
        sampleKeys: data?.slice(0, 5).map(r => r.key) || [],
        duplicateKeys: duplicates
      });
    } catch (err) {
      debug.error('[DebugPanel] Unexpected error:', err);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, [organization?.id]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    debug.settings('[DebugPanel] Manual refresh triggered');
    await Promise.all([fetchDebugInfo(), refetch()]);
    setIsRefreshing(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  // Compare form state vs DB state for key fields
  const comparisons = [
    { label: 'Site Name', formKey: 'siteName', formValue: siteData.siteName, dbValue: settings.siteName },
    { label: 'Tagline', formKey: 'tagline', formValue: siteData.tagline, dbValue: settings.tagline },
    { label: 'Hero Title', formKey: 'heroTitle', formValue: siteData.heroTitle, dbValue: settings.heroTitle },
    { label: 'Contact Email', formKey: 'contactEmail', formValue: siteData.contactEmail, dbValue: settings.contactEmail },
    { label: 'Phone', formKey: 'phone', formValue: siteData.phone, dbValue: settings.phone },
    { label: 'Address', formKey: 'address', formValue: siteData.address, dbValue: settings.address },
  ];

  const hasMismatches = comparisons.some(c => c.formValue !== c.dbValue);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-blue-600" />
          <h4 className="font-medium text-blue-800">Settings Debug Panel</h4>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-7 text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Context Info */}
      <div className="grid grid-cols-2 gap-4 text-blue-700">
        <div className="space-y-1">
          <p className="font-medium text-blue-800">Context:</p>
          <p><strong>User ID:</strong> <code className="bg-blue-100 px-1 rounded text-xs">{user?.id?.slice(0, 8) || 'none'}...</code></p>
          <p><strong>Org ID:</strong> <code className="bg-blue-100 px-1 rounded text-xs">{organization?.id?.slice(0, 8) || 'none'}...</code></p>
          <p><strong>Org Name:</strong> {organization?.name || 'Not loaded'}</p>
          <p><strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-blue-800">Database:</p>
          <p><strong>Settings Rows:</strong> {dbDebug?.rowCount ?? '...'}</p>
          <p><strong>Last Updated:</strong> {formatDate(dbDebug?.lastUpdated ?? null)}</p>
          <p><strong>In-Memory Keys:</strong> {Object.keys(settings).length}</p>
          {dbDebug?.duplicateKeys && dbDebug.duplicateKeys.length > 0 && (
            <p className="text-red-600 font-medium">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Duplicates: {dbDebug.duplicateKeys.join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Form vs DB Comparison */}
      <div className="border-t border-blue-200 pt-3">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-medium text-blue-800">Form State vs Database:</p>
          {hasMismatches ? (
            <span className="text-amber-600 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Mismatches detected
            </span>
          ) : (
            <span className="text-green-600 text-xs flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> In sync
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-1 text-xs">
          {comparisons.map(({ label, formKey, formValue, dbValue }) => {
            const matches = formValue === dbValue;
            return (
              <div 
                key={formKey} 
                className={`flex items-center gap-2 p-1 rounded ${matches ? 'bg-green-50' : 'bg-amber-50'}`}
              >
                <span className="w-24 font-medium">{label}:</span>
                <span className="flex-1 truncate" title={formValue || '(empty)'}>
                  Form: "{formValue || '(empty)'}"
                </span>
                <span className={`flex-1 truncate ${!matches ? 'text-amber-700 font-medium' : ''}`} title={dbValue || '(empty)'}>
                  DB: "{dbValue || '(empty)'}"
                </span>
                {matches ? (
                  <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-amber-600 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User Editing Status */}
      <div className="border-t border-blue-200 pt-3 text-xs text-blue-600">
        <p><strong>User Editing Form:</strong> {isUserEditing ? 'Yes (local changes pending)' : 'No'}</p>
        <p className="mt-1 opacity-75">
          💡 If form values differ from DB, the form may have unsaved changes or failed to load DB values.
        </p>
      </div>
    </div>
  );
};

export default DebugInfoPanel;
