
import { useMemo } from 'react';
import { WorkOrder } from '@/hooks/useWorkOrderManagement';

export const useWorkOrderStats = (workOrders: WorkOrder[]) => {
  const stats = useMemo(() => {
    const totalWorkOrders = workOrders.length;
    const pendingWorkOrders = workOrders.filter(wo => wo.status === 'draft').length;
    const completedWorkOrders = workOrders.filter(wo => wo.status === 'completed' || wo.status === 'paid').length;
    
    return {
      totalWorkOrders,
      pendingWorkOrders,
      completedWorkOrders,
    };
  }, [workOrders]);

  return stats;
};
