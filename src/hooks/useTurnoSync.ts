import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SyncStatus {
  isLoading: boolean;
  lastSyncAt?: string;
  conflicts: number;
  pendingSync: number;
}

export interface SyncResult {
  success: boolean;
  synced?: number;
  conflicts?: number;
  total?: number;
  error?: string;
}

export const useTurnoSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    conflicts: 0,
    pendingSync: 0
  });
  const { toast } = useToast();

  // Sync specific work order status to Turno
  const syncWorkOrderToTurno = async (workOrderId: string): Promise<SyncResult> => {
    try {
      setSyncStatus(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.functions.invoke('turno-sync/sync-status', {
        body: { workOrderId }
      });

      if (error) throw error;

      toast({
        title: 'Sync Complete',
        description: `Work order successfully synced to Turno`,
      });

      return { success: true, synced: 1 };
    } catch (error: any) {
      console.error('Error syncing work order to Turno:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync work order to Turno',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Sync recent problems from Turno
  const syncProblemsFromTurno = async (createWorkOrders = false): Promise<SyncResult> => {
    try {
      setSyncStatus(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.functions.invoke('turno-sync/sync-problems', {
        body: { createWorkOrders }
      });

      if (error) throw error;

      const result = data as SyncResult & { created?: number };
      
      const message = createWorkOrders 
        ? `Created ${result.created || 0} work orders from Turno problems. ${result.conflicts || 0} conflicts detected.`
        : `Updated ${result.synced || 0} work orders from Turno. ${result.conflicts || 0} conflicts detected.`;
      
      toast({
        title: 'Sync Complete',
        description: message,
      });

      setSyncStatus(prev => ({ 
        ...prev, 
        conflicts: result.conflicts || 0,
        lastSyncAt: new Date().toISOString()
      }));

      return result;
    } catch (error: any) {
      console.error('Error syncing problems from Turno:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync problems from Turno',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Bulk import all Turno problems as work orders
  const importProblemsAsWorkOrders = async (): Promise<SyncResult> => {
    try {
      setSyncStatus(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.functions.invoke('turno-sync/import-problems');

      if (error) throw error;

      const result = data as SyncResult & { created?: number };
      
      toast({
        title: 'Import Complete',
        description: `Created ${result.created || 0} work orders from ${result.total || 0} Turno problems.`,
      });

      setSyncStatus(prev => ({ 
        ...prev, 
        lastSyncAt: new Date().toISOString()
      }));

      return result;
    } catch (error: any) {
      console.error('Error importing problems from Turno:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import problems from Turno',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Full bidirectional sync
  const performFullSync = async (): Promise<SyncResult> => {
    try {
      setSyncStatus(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.functions.invoke('turno-sync/sync-full');

      if (error) throw error;

      const result = data as { 
        success: boolean; 
        problemsSync: SyncResult; 
        statusSync: SyncResult; 
      };

      const totalSynced = (result.problemsSync.synced || 0) + (result.statusSync.synced || 0);
      const totalConflicts = result.problemsSync.conflicts || 0;

      toast({
        title: 'Full Sync Complete',
        description: `Synced ${totalSynced} items. ${totalConflicts} conflicts detected.`,
      });

      setSyncStatus(prev => ({ 
        ...prev, 
        conflicts: totalConflicts,
        lastSyncAt: new Date().toISOString()
      }));

      return { 
        success: true, 
        synced: totalSynced, 
        conflicts: totalConflicts 
      };
    } catch (error: any) {
      console.error('Error performing full sync:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to perform full sync',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Get sync logs for a work order
  const getSyncLogs = async (workOrderId: string) => {
    try {
      const { data, error } = await supabase
        .from('turno_sync_log')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      return [];
    }
  };

  // Toggle manual status override for a work order
  const toggleStatusOverride = async (workOrderId: string, override: boolean) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ 
          turno_status_override: override,
          sync_conflict_reason: override ? 'Manual override enabled' : null
        })
        .eq('id', workOrderId);

      if (error) throw error;

      toast({
        title: override ? 'Override Enabled' : 'Override Disabled',
        description: override 
          ? 'This work order will not sync status changes from Turno'
          : 'This work order will resume automatic sync with Turno',
      });

      return true;
    } catch (error: any) {
      console.error('Error toggling status override:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sync override setting',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Check work orders with sync conflicts
  const checkSyncConflicts = async () => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('id, work_order_number, title, sync_conflict_reason')
        .not('sync_conflict_reason', 'is', null);

      if (error) throw error;
      
      setSyncStatus(prev => ({ 
        ...prev, 
        conflicts: data?.length || 0 
      }));

      return data || [];
    } catch (error) {
      console.error('Error checking sync conflicts:', error);
      return [];
    }
  };

  return {
    syncStatus,
    syncWorkOrderToTurno,
    syncProblemsFromTurno,
    importProblemsAsWorkOrders,
    performFullSync,
    getSyncLogs,
    toggleStatusOverride,
    checkSyncConflicts,
  };
};