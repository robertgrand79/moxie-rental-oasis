
import { useMemo } from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

export const useWorkOrderStats = (workOrders: WorkOrder[]) => {
  const stats = useMemo(() => {
    const totalWorkOrders = workOrders.length;
    
    // Pending = work not yet started (draft, sent, acknowledged)
    const pendingWorkOrders = workOrders.filter(
      wo => wo.status === 'draft' || wo.status === 'sent' || wo.status === 'acknowledged'
    ).length;
    
    // In Progress = actively being worked on
    const inProgressWorkOrders = workOrders.filter(
      wo => wo.status === 'in_progress'
    ).length;
    
    // Completed = finished work (completed, invoiced, paid)
    const completedWorkOrders = workOrders.filter(
      wo => wo.status === 'completed' || wo.status === 'invoiced' || wo.status === 'paid'
    ).length;
    
    return {
      totalWorkOrders,
      pendingWorkOrders,
      inProgressWorkOrders,
      completedWorkOrders,
    };
  }, [workOrders]);

  return stats;
};
